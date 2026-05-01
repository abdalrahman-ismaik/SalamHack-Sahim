# MVP Storage Design

## Recommendation

Use Firebase Auth + Firestore for the hackathon MVP user database, and keep
backend service/API responses in the existing FastAPI in-memory TTL cache.

Firestore is the best fit for this project because the frontend already uses
Firebase Auth, the dashboard already reads Firestore-backed user state, and the
MVP needs simple NoSQL documents rather than relational joins or migrations.

## What Firestore Stores

```text
users/{uid}
  email
  name
  photoURL
  locale
  tier
  onboarding
  investmentProfile
  watchlistCount
  halalComplianceRate
  riskProfile
  riskProfileLabel
  lastViewedTicker
  lastViewedAt
  lastZakatDate
  lastZakatResult

users/{uid}/watchlist/{ticker}
  ticker
  name
  exchange
  halalStatus
  addedAt

users/{uid}/risk_profile/current
  user_id
  score
  label
  answers
  completed_at

users/{uid}/alert_preferences/{ticker}
  enabled
  last_known_status
  updated_at
```

The root `tier` field is trusted demo state. New client-created users default to
`free`; Pro/Enterprise demo accounts are promoted through Firebase Console, and
Firestore rules deny client self-promotion.

## What Stays Out

- Brokerage credentials
- Real transactions
- KYC/AML documents
- Payment methods
- Full portfolio imports
- Raw Zakat portfolio, liability, or net input values
- Persistent external service response caches

## Cache Policy

The backend keeps market, news, Halal, forecast, sector, and gold-price data in
`backend/app/cache.py`. This is intentionally memory-only for the MVP: no
database migrations, no server Firestore service account, and fewer demo
failure modes.

Endpoint TTL boundaries:

- `search`, `news`, and `gold-price`: 1 hour
- `score` and `risk`: until daily market rollover
- `halal`, `forecast`, and `sector`/`sectors`: 24 hours

Cache keys are anonymous `(subject, endpoint)` pairs and must not include uid,
email, display name, watchlist membership, alert preferences, or raw Zakat
inputs. Plain service lookups must not create or update `users/{uid}` records.

## Setup

1. Create or use a Firebase project.
2. Enable Authentication providers used by the app.
3. Enable Firestore in Native mode.
4. Copy `frontend/.env.local.example` to `frontend/.env.local`.
5. Fill the `NEXT_PUBLIC_FIREBASE_*` values from Firebase Web App settings.
6. Deploy `firestore.rules` in the Firebase Console.
