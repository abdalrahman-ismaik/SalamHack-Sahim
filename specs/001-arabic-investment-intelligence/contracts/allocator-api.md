# API Contract: Sector Explorer & Budget Allocator

**Resource**: `/api/sectors`, `/api/allocator`
**Scope**: P6 (Could) — Sector Explorer · P7 (Could) — Budget Allocator
**Status**: Could — implement only after P1–P5 (Must features) are complete and
Demo-Day timeline permits.

---

## GET /api/sectors

Returns a list of market sectors for a given exchange, each with aggregated
performance statistics and top-ranked tickers.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `exchange` | `string` | `TADAWUL` | Exchange to scope sectors; e.g. `TADAWUL`, `EGX`, `NASDAQ` |
| `limit` | `int` | `10` | Max sectors to return (1–20) |

### Response — 200 OK

```json
{
  "sectors": [
    {
      "sector_name": "الطاقة",
      "exchange": "TADAWUL",
      "avg_score": 68.4,
      "avg_return_1y": 0.12,
      "top_tickers": ["2222.SR", "2030.SR", "2010.SR"],
      "halal_pct": 0.92
    }
  ],
  "total": 8
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `INVALID_EXCHANGE` | Unknown exchange code |
| 503 | `DATA_UNAVAILABLE` | Could not aggregate sector data |

---

## POST /api/allocator

Calculates a score-weighted budget allocation across a user-supplied basket
of stocks. Halal-screened "haram" tickers are automatically excluded and
their weight redistributed proportionally among the remaining halal/review stocks.

### Request Body

```json
{
  "tickers": ["2222.SR", "2330.SR", "AAPL"],
  "total_budget": 10000.00,
  "currency": "SAR",
  "exclude_haram": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `tickers` | `list[string]` | Yes | 1–10 unique tickers; each matches `^[A-Z0-9.]{1,10}$` |
| `total_budget` | `float` | Yes | > 0, ≤ 10,000,000 |
| `currency` | `string` | Yes | ISO 4217 3-char code |
| `exclude_haram` | `bool` | No | Default `true`; if false, user accepts responsibility |

### Response — 200 OK

```json
{
  "total_budget": 10000.00,
  "currency": "SAR",
  "allocations": [
    {
      "ticker": "2222.SR",
      "pct": 0.55,
      "amount": 5500.00,
      "score": 71.4,
      "verdict": "halal"
    },
    {
      "ticker": "2330.SR",
      "pct": 0.45,
      "amount": 4500.00,
      "score": 58.2,
      "verdict": "review"
    }
  ],
  "excluded_tickers": ["AAPL"],
  "exclusion_reasons": {
    "AAPL": "excluded_haram"
  },
  "generated_at": "2026-04-26T10:00:00Z",
  "disclaimer": "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `INVALID_TICKERS` | Ticker list empty or contains invalid ticker formats |
| 400 | `ALL_EXCLUDED` | All tickers are haram and `exclude_haram = true` |
| 422 | Validation error | Pydantic field validation failure |

---

## Notes

- Both endpoints are **Could priority**. They are designed so that they can be
  added in ≤4 hours once P1–P5 are complete and working.
- The allocator's disclaimer is `"تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"`. It MUST be rendered
  visibly on the allocator result page.
