# API Contract: Stock Analysis Endpoints

**Resource**: `/api/stock/*`
**Base URL**: `https://<backend-host>/api`
**Version**: v1 (no versioning prefix for hackathon MVP)
**Auth**: None for MVP (API keys are server-side only; no client auth)
**Format**: JSON request/response bodies, UTF-8 encoding
**Security**: Input validation via FastAPI/Pydantic; all ticker inputs sanitised;
API keys never exposed in responses.

---

## GET /api/stock/{ticker}

Full analysis bundle for a single stock. This is the primary endpoint used by
the frontend stock analysis page. Runs all sub-services in parallel
(score engine, Halal screener, news agent, ARIMA) and returns a single JSON object.

### Path Parameters

| Param | Type | Validation | Example |
|-------|------|-----------|---------|
| `ticker` | `string` | Matches `^[A-Z0-9.]{1,10}$` (case-insensitive; normalised to uppercase server-side) | `2222.SR`, `AAPL`, `COMI.CA` |

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `locale` | `string` | `ar` | Preferred language for error messages; `ar` or `en` |

### Success Response — 200 OK

```json
{
  "stock": {
    "ticker": "2222.SR",
    "company_name": "أرامكو السعودية",
    "exchange": "TADAWUL",
    "sector": "Energy",
    "current_price": 27.45,
    "currency": "SAR",
    "price_date": "2026-04-25",
    "market_cap": 6900000000000,
    "days_of_history": 780
  },
  "score": {
    "ticker": "2222.SR",
    "total_score": 71.4,
    "band": "green",
    "volatility_score": 82.0,
    "var_score": 74.0,
    "sharpe_score": 65.0,
    "beta_score": 70.0,
    "sentiment_score": 80.0,
    "volatility_raw": 0.217,
    "var_raw": 0.018,
    "sharpe_raw": 0.93,
    "beta_raw": 0.84,
    "rsi": 52.3,
    "macd_value": 0.12,
    "macd_signal": 0.10,
    "pe_ratio": 17.2,
    "low_confidence": false,
    "benchmark_index": "^TASI",
    "computed_at": "2026-04-26T08:00:00Z",
    "data_freshness_label": "آخر تحديث: نهاية جلسة أمس"
  },
  "halal": {
    "ticker": "2222.SR",
    "verdict": "halal",
    "source": "musaffa",
    "debt_ratio": 0.09,
    "interest_ratio": 0.002,
    "purification_pct": null,
    "business_activity_flag": false,
    "reasons": [],
    "disclaimer": "التحقق النهائي من الحلية يقع على عاتق المستخدم"
  },
  "news": [
    {
      "ticker": "2222.SR",
      "source_url": "https://reuters.com/...",
      "source_name": "Reuters",
      "published_at": "2026-04-25T14:30:00Z",
      "what_happened": "أعلنت أرامكو السعودية عن أرباح فصلية قياسية بلغت 32 مليار دولار",
      "why_it_matters": "يعكس هذا الأداء القوي استمرار الطلب العالمي على النفط رغم التوترات الجيوسياسية",
      "who_is_affected": "المساهمون والمستثمرون المؤسسيون في القطاع الطاقوي",
      "time_horizon": "short",
      "sentiment": "positive",
      "fallback_mode": false
    }
  ],
  "arima": {
    "ticker": "2222.SR",
    "forecast_dates": ["2026-04-26", "2026-04-27", "..."],
    "forecast_prices": [27.60, 27.75, "..."],
    "ci_upper": [28.10, 28.35, "..."],
    "ci_lower": [27.10, 27.15, "..."],
    "arima_order": [1, 1, 1],
    "aic_score": -1842.3,
    "base_price": 27.45,
    "insufficient_data": false,
    "disclaimer": "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"
  }
}
```

### Error Responses

| Status | Code | Condition | Arabic message example |
|--------|------|-----------|----------------------|
| 400 | `INVALID_TICKER` | Ticker fails regex | "رمز السهم غير صالح" |
| 404 | `TICKER_NOT_FOUND` | Provider returns no data for ticker | "لم يتم العثور على بيانات لهذا السهم" |
| 429 | `RATE_LIMITED` | Upstream API quota exceeded | "تجاوزت الحد المسموح من الطلبات — حاول مجدداً لاحقاً" |
| 500 | `DATA_FETCH_ERROR` | Unexpected upstream error | "تعذّر جلب البيانات — يُرجى المحاولة مجدداً" |
| 503 | `PARTIAL_DATA` | Score computed but some sub-services failed | Returns partial JSON with null fields for failed components |

**503 Partial Data**: Constitution Principle VI requires the math-engine result
to always be returned when financial data is available. If news agent times out,
`news` is `[]` and `fallback_mode: true`. If Halal screener fails, `halal` is
null and a field `halal_unavailable_reason` is set.

---

## GET /api/stock/{ticker}/score

Returns only the `score` and `stock` objects. Faster endpoint for polling
or progressive loading.

### Response — 200 OK

```json
{
  "stock": { "...same as above..." },
  "score": { "...same as above..." }
}
```

Errors: same codes as the full endpoint.

---

## GET /api/stock/{ticker}/halal

Returns only the `halal` verdict.

### Response — 200 OK

```json
{
  "halal": { "...same as above..." }
}
```

Note: `disclaimer` is always present in the response body and MUST be
rendered visibly in the frontend (not hidden or collapsed by default).

---

## GET /api/stock/{ticker}/news

Returns up to 5 structured Arabic news cards.

### Response — 200 OK

```json
{
  "news": [ "...array of NewsCard objects..." ],
  "ticker": "2222.SR"
}
```

When news is unavailable:

```json
{
  "news": [],
  "ticker": "2222.SR",
  "fallback_message": "تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات الرياضية فقط"
}
```

---

## GET /api/stock/{ticker}/arima

Returns the 30-day ARIMA projection.

### Response — 200 OK

```json
{
  "arima": { "...same as above..." }
}
```

When insufficient data (< 252 days):

```json
{
  "arima": {
    "ticker": "2222.SR",
    "forecast_dates": [],
    "forecast_prices": [],
    "ci_upper": [],
    "ci_lower": [],
    "arima_order": null,
    "aic_score": null,
    "base_price": 27.45,
    "insufficient_data": true,
    "disclaimer": "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"
  }
}
```

---

## GET /api/search

Search for stocks by name or ticker symbol. Used for the search autocomplete.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | `string` | Yes | Search query; min 2 chars; max 50 chars |
| `exchange` | `string` | No | Filter by exchange (e.g. `TADAWUL`) |

### Response — 200 OK

```json
{
  "results": [
    {
      "ticker": "2222.SR",
      "company_name": "أرامكو السعودية",
      "exchange": "TADAWUL",
      "sector": "Energy"
    }
  ],
  "total": 1
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `QUERY_TOO_SHORT` | `q` < 2 chars |
| 400 | `QUERY_TOO_LONG` | `q` > 50 chars |

---

## GET /api/health

Liveness check. Used by Render.com health monitor to prevent cold-start
during the demo.

### Response — 200 OK

```json
{ "status": "ok", "version": "0.1.0" }
```

---

## Common Headers

**Request**:
```
Content-Type: application/json
Accept: application/json
Accept-Language: ar, en;q=0.9
```

**Response**:
```
Content-Type: application/json; charset=utf-8
X-Response-Time: <ms>
Cache-Control: public, max-age=3600  (for EOD data endpoints)
```

**CORS**: Backend must allow the Netlify frontend origin.
`Access-Control-Allow-Origin: https://<netlify-app>.netlify.app`
For local dev: `http://localhost:3000`.

---

## Error Response Schema

All errors follow this envelope:

```json
{
  "error": {
    "code": "TICKER_NOT_FOUND",
    "message_ar": "لم يتم العثور على بيانات لهذا السهم",
    "message_en": "No data found for this ticker",
    "detail": null
  }
}
```

---

## Rate Limiting (Server-side)

To protect the free-tier API quotas during the demo:

| Endpoint | Rate limit |
|----------|-----------|
| `GET /api/stock/{ticker}` | 20 req/min per IP |
| `GET /api/stock/{ticker}/arima` | 10 req/min per IP |
| All others | 60 req/min per IP |

FR-015 (real-time pricing): When enabled (post-MVP), the score endpoint
will additionally enforce a per-user maximum of 5 live-refresh calls/minute.
For MVP this constraint is not applicable (EOD data only).
