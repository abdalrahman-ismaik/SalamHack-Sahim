# Data Model: Firestore MVP User Storage

## Entities

### UserProfile

Root user-owned document for account continuity and dashboard metadata.

**Path**: `users/{uid}`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `email` | string or null | owner-visible only | From authenticated profile |
| `name` | string or null | max 120 chars | Display name |
| `photoURL` | string or null | valid URL when present | Display avatar |
| `locale` | `ar` or `en` | default `ar` | User language preference |
| `tier` | `free`, `pro`, or `enterprise` | trusted field; user cannot self-promote | Used for tier-gated storage |
| `onboarding` | object or null | optional | Completion metadata |
| `investmentProfile` | object or null | optional, demo-safe | Onboarding preferences |
| `watchlistCount` | number | integer >= 0 | Dashboard summary |
| `halalComplianceRate` | number or null | 0-100 or null | Dashboard summary |
| `riskProfile` | string or null | score string or label | Dashboard compatibility field |
| `riskProfileLabel` | string or null | allowed risk labels | Dashboard display |
| `lastViewedTicker` | string or null | uppercase ticker | Dashboard default stock |
| `lastViewedAt` | ISO datetime or null | valid date | Last stock detail view |
| `lastZakatDate` | ISO datetime or null | valid date | Latest Zakat reminder |
| `lastZakatResult` | ZakatMetadata or null | no raw inputs | Latest reminder details |
| `createdAt` | timestamp | set on first create | Audit metadata |
| `updatedAt` | timestamp | set on every merge | Audit metadata |

### WatchlistItem

One saved ticker for a user.

**Path**: `users/{uid}/watchlist/{ticker}`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `ticker` | string | uppercase, document id | Unique per user |
| `name` | string or null | optional | Display name |
| `exchange` | string or null | optional | Market/exchange |
| `halalStatus` | enum or null | `Halal`, `PurificationRequired`, `NonHalal`, `Unknown` | Snapshot only |
| `addedAt` | ISO datetime or timestamp | required on create | Ordering metadata |
| `updatedAt` | ISO datetime or timestamp | required on update | Refresh metadata |

### RiskProfile

Latest completed risk wizard result for a signed-in user.

**Path**: `users/{uid}/risk_profile/current`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `user_id` | string | must match owner uid | Prevent cross-user writes |
| `score` | number | integer 0-100 | Computed score |
| `label` | enum | `conservative`, `moderate`, `aggressive` | Dashboard display |
| `answers` | object | allowed question keys only | Latest answer set |
| `completed_at` | ISO datetime | required | Replacement timestamp |

### ZakatMetadata

Latest reminder metadata for dashboard display.

**Embedded in**: `users/{uid}.lastZakatResult`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `nisab_value` | number | >= 0 | Derived threshold |
| `nisab_source` | `api` or `static` | required | Data source status |
| `gold_price_date` | string | required | Gold price date or fallback label |
| `zakat_due` | number or null | >= 0 when present | Result only |
| `below_nisab` | boolean | required | Reminder state |
| `currency` | `AED`, `USD`, or `SAR` | required | Display currency |
| `calculated_at` | ISO datetime | required | Dashboard reminder date |

`net_value`, raw portfolio value, raw liabilities, and per-asset inputs MUST NOT be
persisted for the MVP.

**Privacy note**: Historical Zakat records and raw portfolio/liability inputs are
out of scope for this MVP.

### ComplianceAlertPreference

One Pro/Enterprise alert preference for a ticker.

**Path**: `users/{uid}/alert_preferences/{ticker}`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `enabled` | boolean | required | Preference state |
| `last_known_status` | enum | `Halal`, `PurificationRequired`, `NonHalal`, `Unknown` | Previous status for comparison |
| `updated_at` | ISO datetime | required | Last preference/status update |

### ServiceCacheEntry

Short-lived backend cache entry for provider responses.

**Location**: process-local backend cache only

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `ticker` | string | uppercase | Cache key part |
| `endpoint` | string | known endpoint family | Cache key part |
| `value` | object | no user identity | Provider or computed response |
| `ttl` | duration | 1h or daily/24h depending on endpoint | Expiration boundary |

## Relationships

- One `UserProfile` has many `WatchlistItem` records.
- One `UserProfile` has one current `RiskProfile`.
- One `UserProfile` has zero or one embedded latest `ZakatMetadata`.
- One `UserProfile` has many `ComplianceAlertPreference` records.
- `ServiceCacheEntry` records are not related to user records and must not store
  user identifiers.

## Validation Rules

- All user-owned document paths require authenticated owner access.
- Tickers are normalized to uppercase before saving.
- Users cannot create duplicate watchlist documents for the same normalized
  ticker.
- `tier` is trusted state; owner updates cannot change it from Free to Pro or
  Enterprise.
- Compliance alert writes require trusted tier `pro` or `enterprise`.
- Risk score must be between 0 and 100.
- Zakat metadata must not include raw portfolio value or liabilities.
- Cache entries must not contain `uid`, email, display name, or user preference
  fields.

## State Transitions

- `UserProfile`: missing -> created on authenticated sign-in/signup -> merged
  as profile/dashboard metadata changes.
- `WatchlistItem`: absent -> saved -> updated display metadata -> removed.
- `RiskProfile`: absent -> current profile -> replaced on retake.
- `ZakatMetadata`: absent -> latest reminder -> replaced on each calculation.
- `ComplianceAlertPreference`: absent -> enabled -> status refreshed -> disabled
  or removed.
- `ServiceCacheEntry`: absent -> cached -> expired -> refreshed or fallback.
