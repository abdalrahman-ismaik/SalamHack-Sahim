# Data Model: Dashboard Refactor

## Key Entities

### 1. KPI Summary
- **Fields:**
  - `watchlistCount: number` — Number of tickers in user's watchlist
  - `halalComplianceRate: number` — % of watchlist tickers currently Halal
  - `riskProfile: 'محافظ' | 'متوازن' | 'جريء' | null` — User's risk label (from Risk Wizard)
  - `lastZakatDate: string | null` — ISO date of last Zakat calculation
  - `lastViewedTicker: string` — Most recently viewed stock symbol

### 2. ARIMA Chart Data
- **Fields:**
  - `ticker: string`
  - `series: Array<{ date: string, price: number, ci_upper: number, ci_lower: number }>`
  - `horizon: 7 | 30` — Days (7 for Free, 30 for Pro)

### 3. Portfolio Allocation
- **Fields:**
  - `sectors: Array<{ sector: string, value: number }>`
  - `assetTypes: Array<{ type: string, value: number }>`

### 4. Sector Performance
- **Fields:**
  - `period: 'week' | 'month' | 'quarter'`
  - `sectors: Array<{ sector: string, percentChange: number }>`

### 5. Risk Score
- **Fields:**
  - `score: number` — 0–100 composite risk score
  - `label: 'محافظ' | 'متوازن' | 'جريء' | null`

### 6. News Headline
- **Fields:**
  - `ticker: string`
  - `headline: string`
  - `source: string`
  - `timestamp: string` — ISO date
  - `url: string`
  - `halalStatus: 'حلال' | 'غير حلال' | 'يحتاج تطهير'`

### 7. Service Card
- **Fields:**
  - `id: string`
  - `title: string` (localized)
  - `description: string` (localized)
  - `icon: string`
  - `tier: 'free' | 'pro' | 'enterprise'`
  - `route: string`

## Relationships
- User has many Watchlist tickers
- Each Watchlist ticker can have many News Headlines
- User has one Risk Profile, one lastZakatDate, one lastViewedTicker
- Portfolio Allocation and Sector Performance are derived from watchlist holdings

## MVP Storage Mapping
- `users/{uid}` — KPI summary fields, tier/profile metadata, onboarding summary,
  `lastZakatDate`, `lastZakatResult`, and `lastViewedTicker`
- `users/{uid}/watchlist/{ticker}` — saved dashboard/watchlist tickers
- `users/{uid}/risk_profile/current` — dashboard risk score source
- `users/{uid}/alert_preferences/{ticker}` — Halal compliance alert preferences
- Backend market/news/forecast/sector responses remain in the FastAPI in-memory
  TTL cache and are not persisted in Firestore for the MVP.

## Validation Rules
- All numeric fields must be >= 0
- Risk Score must be 0–100
- News Headline must have valid URL and timestamp
- Service Card tier must match allowed values

## State Transitions
- Risk Profile: null → set via Risk Wizard
- lastZakatDate: null → set via Zakat Calculator
- lastViewedTicker: updated on each stock page visit

---

This data model supports all dashboard zones and navigation logic as specified.
