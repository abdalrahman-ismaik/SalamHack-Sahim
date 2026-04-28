# Research: Halal Investor Tools Suite (003)

**Phase**: 0 — Research & Unknowns Resolution  
**Date**: 2026-04-28  
**Status**: Complete — all unknowns resolved

---

## Unknown 1: Gold Price Data for Zakat Nisab

**Question**: Is there an existing mechanism to fetch gold prices for nisab calculation? If not, which API can be used?

**Decision**: Add `get_gold_price()` to `backend/app/services/market_data.py` using the **Twelve Data API** with the `XAUUSD` (gold vs USD) symbol.

**Rationale**: Twelve Data is already configured (`twelve_data_api_key` in `Settings`) and used for all market data. The `/quote` endpoint supports commodity symbols including `XAUUSD`. No new API key or dependency is required. The existing `_client()` helper and timeout patterns from `market_data.py` are reused directly.

**Fallback**: If the API call fails, fall back to a hardcoded configurable constant: **AED 264.70/g** (≈ AED 22,500 for 85g, as of April 2026 gold price). The UI MUST display a "قيمة ثابتة — تحديث مرجو" label when the fallback is used.

**Alternatives considered**: Alpha Vantage `PHYSICAL_CURRENCY_EXCHANGE_RATE` (rejected — separate API call pattern, slower); external gold price API (rejected — requires new key).

---

## Unknown 2: User Preference Storage for Compliance Alerts

**Question**: There is no database or per-user storage layer in the backend (no SQLAlchemy, no ORM, no DB provider). How can compliance alert preferences be stored server-side for Pro-tier users?

**Decision**: Use **Firebase Firestore** (client-side) for alert preference storage.

**Rationale**: Firebase is already initialized in `frontend/src/lib/firebase.ts` (Auth only). Adding Firestore requires only appending `getFirestore(app)` to the existing init — no new package installation (the Firebase SDK v9 bundle already includes Firestore). Firestore provides persistent, cross-device sync without any backend changes. The authenticated user's UID from Firebase Auth is used as the document key: `users/{uid}/alert_preferences/{ticker}`.

**Schema**: Each document stores `{ enabled: boolean, last_known_status: "Halal" | "PurificationRequired" | "NonHalal" | "Unknown" }`. On Dashboard load, the hook reads the current status from the existing `/api/stock/{ticker}/halal` endpoint, compares against stored `last_known_status`, and fires an in-app notification if they differ. The hook then updates `last_known_status` in Firestore.

**Alternatives considered**: localStorage (rejected — not cross-device, insufficient for Pro-tier expectation); new FastAPI + SQLite backend model (rejected — requires ORM setup, DB provider, migration tooling — too heavy for hackathon timeline); in-memory FastAPI dict (rejected — lost on server restart, not user-scoped).

---

## Unknown 3: Non-Halal Revenue Ratio Source for Purification Calculator

**Question**: The Purification Calculator needs `non_halal_revenue_pct`. Does the existing `HalalVerdict` model expose this field?

**Decision**: Use `interest_income_ratio` from `HalalVerdict` as the purification percentage.

**Rationale**: The HalalScreener API returns `prohibitedIncomePct` which the screener service maps to `HalalVerdict.interest_income_ratio`. This field is semantically equivalent to "Non-Compliant Revenue / Total Revenue" used in the Islamicly purification formula. No backend schema change is required. The Purification Calculator component reads `halalVerdict.interest_income_ratio` directly from the existing HalalPanel prop.

**Limitation**: `interest_income_ratio` may be `null` when the screener API omits it. In this case the Purification Calculator MUST show the disabled state per FR-P06 ("النسبة غير متاحة").

**Alternatives considered**: Adding a dedicated `non_halal_revenue_pct` field to `HalalVerdict` (rejected — unnecessary schema change, same data under a new name; can be done as a rename in a future cleanup sprint).

---

## Unknown 4: Risk Wizard Scoring — Client-side vs Server-side

**Question**: Should the Risk Tolerance Wizard scoring calculation happen on the backend (new API endpoint) or entirely in the browser?

**Decision**: **Pure client-side scoring** — no backend endpoint needed.

**Rationale**: The scoring formula is a deterministic weighted sum: `score = Σ(answer_value × weight)` for 8 dimensions. It contains no sensitive data and produces no investment recommendation beyond a label. Running it client-side: (a) satisfies the guest-accessible requirement (no auth token needed), (b) removes a network round-trip (instant result), (c) keeps the wizard functional offline. For authenticated users, the resulting `RiskProfile` object is stored in browser localStorage (guests) or as a Firestore document (logged-in users) under `users/{uid}/risk_profile`.

**Alternatives considered**: Backend scoring endpoint (rejected — adds network latency, complicates guest flow, provides zero security benefit for a non-sensitive label computation).

---

## Unknown 5: App Router Routing for New Tool Pages

**Question**: What route structure should the new tool pages follow, and does a `tools/` directory exist?

**Decision**: Create `frontend/src/app/[locale]/tools/` with sub-pages:
- `tools/risk-wizard/page.tsx` → route `/ar/tools/risk-wizard` and `/en/tools/risk-wizard`
- `tools/zakat/page.tsx` → route `/ar/tools/zakat` and `/en/tools/zakat`

**Rationale**: Follows the existing App Router convention (`[locale]/dashboard/`, `[locale]/stock/[ticker]/`). No `tools/` directory currently exists — it will be created fresh. Both pages are new and follow the `locale`-prefixed pattern mandatory for `next-intl`.

---

## Summary: All Unknowns Resolved

| Unknown | Resolution | Backend Change? | Frontend Change? |
|---------|-----------|----------------|-----------------|
| Gold price for nisab | `get_gold_price()` via Twelve Data | New function + endpoint | New page calls it |
| User pref storage | Firebase Firestore | None | Add `getFirestore` to `firebase.ts` |
| Non-halal revenue ratio | `interest_income_ratio` in `HalalVerdict` | None | Direct prop read |
| Wizard scoring location | Client-side only | None | Component logic |
| Tool page routing | New `tools/` directory | None | New pages |
