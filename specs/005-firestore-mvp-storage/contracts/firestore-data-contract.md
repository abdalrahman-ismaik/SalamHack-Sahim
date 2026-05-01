# Contract: Firestore User Data

## Scope

This contract defines the MVP Firestore user-owned storage boundary. It is a
contract for document paths, ownership, allowed data, and tier-sensitive writes.

## Owner-Scoped Paths

```text
users/{uid}
users/{uid}/watchlist/{ticker}
users/{uid}/risk_profile/current
users/{uid}/alert_preferences/{ticker}
```

All reads and writes require an authenticated user whose id equals `{uid}`.

## Root User Document

Required behavior:

- Create on authenticated signup or first authenticated dashboard session.
- Merge updates rather than replacing the full document.
- Default `tier` is `free`.
- Owner may update profile/display preferences.
- Owner may not self-promote `tier`.
- Pro/Enterprise demo tier changes are seeded through Firebase Console or an
  equivalent trusted admin path, not through client code.

Minimum default fields:

```json
{
  "email": "user@example.com",
  "name": "Display Name",
  "photoURL": null,
  "locale": "ar",
  "tier": "free",
  "watchlistCount": 0,
  "halalComplianceRate": null,
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

## Watchlist Contract

Document id is normalized uppercase ticker.

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ",
  "halalStatus": "Halal",
  "addedAt": "2026-05-01T12:00:00.000Z",
  "updatedAt": "2026-05-01T12:00:00.000Z"
}
```

Rules:

- `ticker` must match the document id.
- Duplicate casing variants must collapse to one document.
- Missing optional display fields must not block saving the ticker.

## Risk Profile Contract

```json
{
  "user_id": "<uid>",
  "score": 64,
  "label": "moderate",
  "answers": {
    "q1": 2,
    "q2": 1,
    "q3": 1,
    "q4": 0,
    "q5": 2,
    "q6": 2
  },
  "completed_at": "2026-05-01T12:00:00.000Z"
}
```

Rules:

- Only `current` is required for MVP.
- Retaking the wizard replaces the current document.
- `user_id` must match the owner uid.

## Zakat Metadata Contract

Embedded at `users/{uid}.lastZakatResult`.

```json
{
  "nisab_value": 8202.5,
  "nisab_source": "api",
  "gold_price_date": "2026-05-01",
  "zakat_due": 1250,
  "below_nisab": false,
  "currency": "AED",
  "calculated_at": "2026-05-01T12:00:00.000Z"
}
```

Rules:

- Store latest reminder only.
- Do not store raw portfolio value.
- Do not store raw liabilities.
- Do not store net portfolio value or net input values.
- Use `lastZakatDate` on the root document for dashboard reminders.

## Compliance Alert Preference Contract

```json
{
  "enabled": true,
  "last_known_status": "Halal",
  "updated_at": "2026-05-01T12:00:00.000Z"
}
```

Rules:

- Writes require owner access.
- Writes require trusted tier `pro` or `enterprise`.
- Free users receive an upgrade prompt and no alert preference write occurs.
- Status values are snapshots for comparison, not religious rulings.

## Security Rule Expectations

Rules must enforce:

- authenticated owner access for all `users/{uid}` paths
- no fallback public reads
- no writes outside declared MVP paths
- no owner self-promotion of `tier`
- alert preference writes only for trusted Pro/Enterprise users

## Out of Scope

- Broker credentials
- KYC/AML documents
- Payment methods
- Real transactions
- Full portfolio imports
- Historical Zakat records
- Persistent provider-response cache
