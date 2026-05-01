# Data Model: Halal Investor Tools Suite (003)

**Phase**: 1 — Design  
**Date**: 2026-04-28  
**Source**: research.md + spec.md + existing `backend/app/models/stock.py`

---

## Entities

### 1. RiskProfile

Represents a user's completed risk tolerance assessment.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `user_id` | `string \| null` | nullable | null for guest sessions |
| `score` | `integer` | 0 – 100 | Weighted sum of answer values |
| `label` | `enum` | `conservative \| moderate \| aggressive` | 0–40 → conservative; 41–70 → moderate; 71–100 → aggressive |
| `answers` | `object` | 8 keys (q1–q8) | Each value 0–4 (answer index) |
| `completed_at` | `string` | ISO 8601 | |

**Scoring weights** (total = 100):

| Dimension | Weight | Question ID |
|-----------|--------|------------|
| Investment horizon | 25% | q1 |
| Drawdown tolerance | 20% | q2 |
| Age group | 15% | q3 |
| Market knowledge | 15% | q4 |
| Income stability | 15% | q5 |
| Holding patience | 10% | q6 |
| (spare) | — | q7, q8 optional extension slots |

**Storage**: Browser `localStorage` key `ahim_risk_profile` for guests; Firestore `users/{uid}/risk_profile/current` for authenticated users.

**State transitions**: None — a completed profile replaces any previous one.

---

### 2. PurificationInput / PurificationResult

Ephemeral — computed client-side, never persisted.

**Input:**

| Field | Type | Constraints |
|-------|------|-------------|
| `dividend_amount` | `number` | > 0 |
| `currency` | `enum` | `AED \| USD \| SAR` |
| `non_halal_pct` | `number` | 0 – 100 (from `HalalVerdict.interest_income_ratio × 100`) |

**Result:**

| Field | Type | Notes |
|-------|------|-------|
| `purification_amount` | `number` | `dividend_amount × (non_halal_pct / 100)` |
| `pct_used` | `number` | Same as `non_halal_pct` |
| `currency` | `string` | Echoed from input |
| `formula_display` | `string` | Human-readable formula for "كيف يُحسب هذا؟" section |

**Validation rules**:
- `dividend_amount` must be a positive finite number
- `non_halal_pct` must be a finite number between 0 and 100 (exclusive of 0 — 0% = no purification needed; 100% = entirely non-compliant, treated as edge case with a warning)

---

### 3. ZakatInput / ZakatResult

Computed client-side. The full calculator form is not persisted, but the latest
authenticated result metadata is saved on `users/{uid}` for the dashboard Zakat
reminder (`lastZakatDate`, `lastZakatResult`).

**Input:**

| Field | Type | Constraints |
|-------|------|-------------|
| `portfolio_value` | `number` | ≥ 0 |
| `liabilities` | `number` | ≥ 0 |
| `currency` | `enum` | `AED \| USD \| SAR` |

**Result:**

| Field | Type | Notes |
|-------|------|-------|
| `net_value` | `number` | `portfolio_value − liabilities` |
| `nisab_value` | `number` | 85 × gold_price_per_gram (converted to selected currency) |
| `nisab_source` | `enum` | `api \| static` |
| `gold_price_date` | `string` | ISO 8601 date, or "2026-04-28 (static)" |
| `zakat_due` | `number \| null` | `net_value × 0.025` if above nisab, else `null` |
| `below_nisab` | `boolean` | true if `net_value < nisab_value` |

---

### 4. GoldPriceResponse

Backend API response from `GET /api/tools/gold-price`.

| Field | Type | Notes |
|-------|------|-------|
| `price_per_gram_usd` | `number` | From Twelve Data `XAUUSD` (price per troy oz ÷ 31.1035) |
| `price_per_gram_aed` | `number` | `price_per_gram_usd × 3.6725` (fixed AED/USD rate) |
| `price_per_gram_sar` | `number` | `price_per_gram_usd × 3.75` (fixed SAR/USD rate) |
| `source` | `string` | `"TwelveData"` or `"static"` |
| `date` | `string` | ISO 8601 date string |

---

### 5. ComplianceAlertPreference

Per-user, per-ticker alert preference stored in Firestore.

**Firestore path**: `users/{uid}/alert_preferences/{ticker}`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `enabled` | `boolean` | | Pro-tier only |
| `last_known_status` | `HalalStatus` | `Halal \| PurificationRequired \| NonHalal \| Unknown` | Updated each Dashboard refresh |
| `updated_at` | `string` | ISO 8601 | Timestamp of last status write |

---

### 6. ComplianceChangeNotification

In-memory object (not persisted). Generated in `useComplianceAlerts` hook when a status change is detected.

| Field | Type | Notes |
|-------|------|-------|
| `ticker` | `string` | |
| `previous_status` | `HalalStatus` | |
| `current_status` | `HalalStatus` | |
| `detected_at` | `string` | ISO 8601 |

---

## Relationship Diagram

```
User (Firebase Auth uid)
  │
  ├── Firestore: users/{uid}
  │       └── Dashboard profile metadata (tier, watchlistCount, lastZakatDate,
  │           lastViewedTicker)
  │
  ├── Firestore: users/{uid}/risk_profile/current
  │       └── RiskProfile (1 per user)
  │
  └── Firestore: users/{uid}/alert_preferences/{ticker}
          └── ComplianceAlertPreference (0..N per user, Pro-only)

HalalVerdict (existing, from backend)
  └── .interest_income_ratio → used as non_halal_pct in PurificationInput

GoldPriceResponse (from GET /api/tools/gold-price)
  └── .price_per_gram_* → used as nisab basis in ZakatInput
```

---

## Validation Rules Summary

| Entity | Field | Rule |
|--------|-------|------|
| RiskProfile | score | 0 ≤ score ≤ 100, computed not user-entered |
| PurificationInput | dividend_amount | > 0, finite |
| PurificationInput | non_halal_pct | 0 < value ≤ 100 (≤ 0 hides calculator) |
| ZakatInput | portfolio_value | ≥ 0 |
| ZakatInput | liabilities | ≥ 0 and ≤ portfolio_value (warn if liabilities > portfolio_value) |
| GoldPriceResponse | price_per_gram_usd | > 0; fallback if missing or 0 |
| ComplianceAlertPreference | enabled | false for Free-tier users (enforced client-side; no data stored) |

---

## Existing Model Reuse

| Existing Model | How Reused |
|----------------|-----------|
| `HalalVerdict` | PurificationCalculator reads `.interest_income_ratio`; ComplianceAlertPreference reads `.status` |
| `RiskMetrics` | Risk Wizard result may pre-fill the Portfolio Allocator's risk selection (via prop or localStorage) |
| `UserSession` | Tier check (`session.tier === 'pro'`) gates compliance alert toggle |
