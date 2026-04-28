# API Contract: Tools Endpoints (003-halal-investor-tools)

**Base URL**: `/api/tools`  
**Authentication**: None required (all tools endpoints are public)  
**Response format**: JSON (all responses)  
**Error format**: `{ "detail": "<message>" }` (FastAPI default)

---

## GET /api/tools/gold-price

Returns the current gold price per gram in USD, AED, and SAR, to be used as the nisab basis for Zakat calculation.

### Response — 200 OK

```json
{
  "price_per_gram_usd": 97.21,
  "price_per_gram_aed": 357.02,
  "price_per_gram_sar": 364.54,
  "source": "TwelveData",
  "date": "2026-04-28"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `price_per_gram_usd` | `float` | Gold price per gram in USD (troy oz price ÷ 31.1035) |
| `price_per_gram_aed` | `float` | `price_per_gram_usd × 3.6725` (fixed peg) |
| `price_per_gram_sar` | `float` | `price_per_gram_usd × 3.75` (fixed peg) |
| `source` | `string` | `"TwelveData"` when live, `"static"` when fallback |
| `date` | `string` | ISO 8601 date of the price |

### Response — Fallback (API unavailable)

Same response shape, but `source` = `"static"` and `date` = last hardcoded update date. HTTP status is still **200** (graceful degradation per Principle VI — never return an error when a safe fallback exists).

```json
{
  "price_per_gram_usd": 96.50,
  "price_per_gram_aed": 354.38,
  "price_per_gram_sar": 361.88,
  "source": "static",
  "date": "2026-04-28"
}
```

### Caching

Response is cached for **1 hour** using the existing `cache.py` TTL mechanism, keyed as `gold_price`. This limits Twelve Data API usage and ensures fast response on the Zakat Calculator.

---

## Existing Endpoints Consumed (No Changes)

The following existing endpoints are used by the new tool pages with no modification:

### GET /api/stock/{ticker}/halal → `HalalVerdict`

Used by:
- **PurificationCalculator**: reads `interest_income_ratio` as the non-halal percentage
- **ComplianceAlerts hook**: reads `status` on Dashboard refresh to compare against stored `last_known_status`

```json
{
  "ticker": "AAPL",
  "status": "PurificationRequired",
  "source": "HalalScreener",
  "disclaimer": "التحقق النهائي من الحلية يقع على عاتق المستخدم",
  "sector": "Technology",
  "debt_market_cap_ratio": 0.18,
  "interest_income_ratio": 0.032,
  "checked_at": "2026-04-28T14:30:00Z"
}
```

> **Purification mapping**: `non_halal_pct = interest_income_ratio × 100` → `3.2%`

---

## Firestore Client Contracts

Not REST — these are Firestore document schemas accessed from the frontend using Firebase SDK.

### `users/{uid}/risk_profile` (Free + Pro)

```json
{
  "score": 65,
  "label": "moderate",
  "answers": {
    "q1": 2, "q2": 3, "q3": 1, "q4": 2, "q5": 3, "q6": 2
  },
  "completed_at": "2026-04-28T10:00:00Z"
}
```

### `users/{uid}/alert_preferences/{ticker}` (Pro only)

```json
{
  "enabled": true,
  "last_known_status": "Halal",
  "updated_at": "2026-04-28T14:30:00Z"
}
```
