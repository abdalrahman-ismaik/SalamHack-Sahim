# Contract: Backend TTL Service Cache

## Scope

This contract defines the MVP backend cache boundary for external provider and
computed service responses. Cache entries are process-local, short-lived, and
not user-owned records.

## Cache Key

```text
(ticker, endpoint)
```

Rules:

- `ticker` is normalized uppercase.
- `endpoint` is a known service family such as `search`, `news`, `score`,
  `risk`, `halal`, `forecast`/`arima`, `sector`/`sectors`, or `gold-price`.
- Cache keys must not include user id, email, name, tier, or account-specific
  preferences.

## TTL Expectations

| Endpoint | TTL expectation | Reason |
|----------|-----------------|--------|
| `search` | 1 hour | Search results can shift during a day |
| `news` | 1 hour | News is time-sensitive |
| `score` | Until daily market rollover | EOD score is daily enough for MVP |
| `halal` | 24 hours | Fundamentals do not change minute-to-minute |
| `forecast`/`arima` | 24 hours | Forecast is derived from EOD-ish series |
| `sector`/`sectors` | 24 hours | Sector comparison is demo-stable |
| `gold-price` | 1 hour where applicable | Zakat nisab should refresh more often |

## Cached Value Requirements

Cached values may include:

- provider response payloads
- computed score/risk/forecast/news/sector/halal results
- source and freshness metadata
- fallback source markers

Cached values must not include:

- user id
- email or display name
- auth token
- watchlist membership
- alert preferences
- raw Zakat portfolio/liability inputs
- brokerage, KYC, payment, or transaction data

## Failure Behavior

- If cache lookup misses, service fetch/compute may run.
- If provider fetch fails, feature-specific graceful degradation applies.
- If cached value is stale or malformed, it must be ignored and refreshed or
  replaced with a user-visible fallback.
- User-owned Firestore data must remain readable when service cache fails.

## Non-Goals

- No persistent cache database for MVP.
- No cross-process cache consistency guarantee.
- No historical market/news archive.
- No cache entries keyed by user identity.
