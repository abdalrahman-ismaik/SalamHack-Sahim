# Tasks: Firestore MVP User Storage

**Input**: Design documents from `/specs/005-firestore-mvp-storage/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No TDD or automated test-first approach was explicitly requested. Validation tasks are included in the final phase using the quickstart scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each persisted slice.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Every task includes exact file paths to edit or validate

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align existing project config, docs, and shared types with the Firestore MVP storage boundary.

- [x] T001 Update Firebase public environment variable documentation in `frontend/.env.local.example`
- [x] T002 Update MVP storage overview and out-of-scope data list in `docs/mvp-storage.md`
- [x] T003 [P] Ensure shared storage-related TypeScript types cover UserProfile, WatchlistItem, RiskProfile, ZakatMetadata, ComplianceAlertPreference, and ServiceCacheEntry in `frontend/src/lib/types.ts`
- [x] T004 [P] Ensure Firebase Auth and Firestore exports remain centralized in `frontend/src/lib/firebase.ts`
- [x] T005 [P] Add or update localized storage-state messages for save failures, unavailable persistence, upgrade prompts, and empty states in `frontend/src/messages/ar.json` and `frontend/src/messages/en.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish owner-scoped security, shared Firestore helpers, and cache-boundary documentation before any user story work.

**CRITICAL**: No user story work should begin until this phase is complete.

- [x] T006 Tighten owner-only Firestore access and deny fallback public reads in `firestore.rules`
- [x] T007 Add Firestore rule constraints preventing owner self-promotion of `users/{uid}.tier` in `firestore.rules`
- [x] T008 Add Firestore rule constraints allowing `users/{uid}/alert_preferences/{ticker}` writes only for trusted `pro` or `enterprise` tier users in `firestore.rules`
- [x] T009 Create reusable user document merge helpers for default profile creation, safe partial updates, last viewed ticker, and sanitized Zakat metadata in `frontend/src/lib/firestore-user.ts`
- [x] T010 [P] Document Firestore data contract decisions and security rule expectations in `specs/005-firestore-mvp-storage/contracts/firestore-data-contract.md`
- [x] T011 [P] Document backend cache key, TTL, privacy, and failure requirements in `specs/005-firestore-mvp-storage/contracts/backend-cache-contract.md`
- [x] T012 [P] Update quickstart validation steps for two-account access denial, Firebase Console trusted-tier demo seeding, denied client self-promotion, Pro alert gating, and cache privacy checks in `specs/005-firestore-mvp-storage/quickstart.md`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Persist Signed-In User Profile (Priority: P1) MVP

**Goal**: Signed-in users get a durable root profile document with locale, tier, profile metadata, onboarding summary, and dashboard defaults.

**Independent Test**: Create or sign in to an account, complete onboarding, leave the dashboard, return with the same account, and see the same profile context without repeating onboarding.

### Implementation for User Story 1

- [x] T013 [US1] Wire email/password sign-in to create or merge the root user profile document in `frontend/src/components/auth/SignInForm.tsx`
- [x] T014 [US1] Wire Google sign-in to create or merge the root user profile document in `frontend/src/components/auth/SignInForm.tsx`
- [x] T015 [US1] Wire email/password sign-up to create the root user profile document with default tier and locale in `frontend/src/components/auth/SignUpForm.tsx`
- [x] T016 [US1] Wire Google sign-up to create or merge the root user profile document with default tier and locale in `frontend/src/components/auth/SignUpForm.tsx`
- [x] T017 [US1] Ensure authenticated client hydration updates the root user profile without overwriting trusted tier state in `frontend/src/providers/UserProviderClient.tsx`
- [x] T018 [US1] Persist onboarding summary and safe investment profile metadata to the root user document in `frontend/src/components/dashboard/DashboardOnboardingChecklist.tsx`
- [x] T019 [US1] Read dashboard profile defaults and gracefully handle missing user records in `frontend/src/hooks/useDashboardKPI.ts`
- [x] T020 [US1] Surface localized persistence-unavailable messaging for profile/onboarding failures in `frontend/src/components/dashboard/DashboardOnboardingChecklist.tsx`

**Checkpoint**: User Story 1 is independently functional and can be demoed as account continuity.

---

## Phase 4: User Story 2 - Preserve Watchlist, Risk, and Zakat State (Priority: P1)

**Goal**: Watchlist, latest risk profile, latest viewed ticker, and latest Zakat reminder survive reloads and return visits without persisting raw sensitive inputs.

**Independent Test**: Save watchlist tickers, complete the risk wizard, calculate Zakat, reload the dashboard, and confirm watchlist count, risk state, last viewed ticker, and Zakat reminder remain.

### Implementation for User Story 2

- [x] T021 [P] [US2] Add watchlist save/remove helper functions with uppercase ticker normalization in `frontend/src/lib/watchlist-storage.ts`
- [x] T022 [US2] Update watchlist reading and count handling to tolerate missing or empty subcollections in `frontend/src/hooks/useWatchlist.ts`
- [x] T023 [US2] Integrate watchlist save/remove helper calls into stock detail or dashboard ticker controls in `frontend/src/app/[locale]/stock/[ticker]/page.tsx`
- [x] T024 [US2] Persist latest viewed ticker with uppercase normalization and merge semantics in `frontend/src/hooks/useLastViewedTicker.ts`
- [x] T025 [US2] Persist signed-in risk wizard results to `users/{uid}/risk_profile/current` and dashboard compatibility fields in `frontend/src/app/[locale]/tools/risk-wizard/page.tsx`
- [x] T026 [US2] Preserve guest risk profile only as local fallback without account writes in `frontend/src/lib/risk-profile-storage.ts`
- [x] T027 [US2] Emit calculation callback data from the Zakat calculator without requiring account persistence in `frontend/src/components/ZakatCalculator.tsx`
- [x] T028 [US2] Persist only latest Zakat reminder metadata and omit raw portfolio value, liabilities, and net input values in `frontend/src/app/[locale]/tools/zakat/page.tsx`
- [x] T029 [US2] Sanitize saved Zakat metadata before writing `lastZakatResult` in `frontend/src/lib/firestore-user.ts`
- [x] T030 [US2] Ensure dashboard Zakat and risk KPI cards handle absent, stale, or unavailable persisted state in `frontend/src/app/[locale]/dashboard/page.tsx`

**Checkpoint**: User Story 2 is independently functional and can be demoed as dashboard state continuity.

---

## Phase 5: User Story 3 - Manage Compliance Alerts Privately (Priority: P2)

**Goal**: Pro and Enterprise users can store per-ticker compliance alert preferences privately; Free users receive an upgrade prompt and no Pro alert write.

**Independent Test**: Sign in as one Pro user, enable a ticker alert, sign in as another user, and confirm the second user cannot read or change the first user's alert preference.

### Implementation for User Story 3

- [x] T031 [US3] Enforce Pro/Enterprise-only alert preference writes in `firestore.rules`
- [x] T032 [US3] Prevent client writes that attempt to self-promote tier or bypass alert gating in `firestore.rules`
- [x] T033 [US3] Add trusted tier checks before alert preference writes in `frontend/src/hooks/useComplianceAlerts.ts`
- [x] T034 [US3] Ensure Free-user alert toggle interaction shows localized upgrade messaging without writing alert preference data in `frontend/src/components/ComplianceAlertToggle.tsx`
- [x] T035 [US3] Store enabled state, last known halal status, and update timestamp per ticker in `frontend/src/hooks/useComplianceAlerts.ts`
- [x] T036 [US3] Update dashboard alert diffing to refresh last known status after a detected change in `frontend/src/components/dashboard/DashboardAlertsBanner.tsx`
- [x] T037 [US3] Ensure compliance alert notifications remain in-app only and do not imply a religious ruling in `frontend/src/components/ComplianceNotificationBanner.tsx`

**Checkpoint**: User Story 3 is independently functional and can be demoed as private Pro alert preference storage.

---

## Phase 6: User Story 4 - Keep Service Cache Boundaries Clear (Priority: P3)

**Goal**: Backend provider responses remain short-lived, anonymous service data and never become user-owned persistent records.

**Independent Test**: Request the same stock/service data twice within the cache window, confirm cache reuse, and confirm no user document is created or updated by a plain service lookup.

### Implementation for User Story 4

- [x] T038 [US4] Audit cache key construction to ensure no user identity or preference data enters cache keys in `backend/app/cache.py`
- [x] T039 [US4] Add `gold-price` or equivalent tool cache TTL handling for Zakat nisab service responses in `backend/app/cache.py`
- [x] T040 [US4] Ensure stock score, halal, news, forecast, and sector route handlers use anonymous cache keys only in `backend/app/api/stock.py` and `backend/app/api/sectors.py`
- [x] T041 [US4] Ensure gold-price/tool route handlers use anonymous cache keys only in `backend/app/api/tools.py`
- [x] T042 [US4] Document reduced-mode behavior when provider cache misses and provider fetch fails in `backend/app/services/market_data.py`, `backend/app/services/news_fetcher.py`, and `backend/app/services/halal_screener.py`
- [x] T043 [US4] Ensure cache privacy boundaries and out-of-scope provider history are reflected in `docs/mvp-storage.md`

**Checkpoint**: User Story 4 is independently functional and can be demoed as cache-boundary discipline.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the feature across docs, rules, build, and demo flows.

- [x] T044 [P] Run TypeScript validation from `frontend/` with `npx tsc --noEmit --pretty false`
- [x] T045 [P] Run production build validation from `frontend/` with `npm run build`
- [x] T046 Validate two-account owner isolation, denied client tier self-promotion, and Pro alert gating using `firestore.rules`
- [ ] T047 Validate quickstart account continuity, watchlist, risk, Zakat, cache-boundary scenarios, 3-second dashboard reload, under-60-second signup, provider-call avoidance, and 9-of-10 storage-unavailable outcomes in `specs/005-firestore-mvp-storage/quickstart.md`
- [x] T048 [P] Review storage requirements checklist findings and update unresolved requirement gaps in `specs/005-firestore-mvp-storage/checklists/storage.md`
- [x] T049 [P] Update README storage setup summary and Firestore rule deployment note in `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; MVP account continuity.
- **Phase 4 US2**: Depends on Phase 2; can proceed after shared helpers are ready, but dashboard polish benefits from US1.
- **Phase 5 US3**: Depends on Phase 2 and trusted tier rules.
- **Phase 6 US4**: Depends on Phase 2; can proceed in parallel with user-state stories because it touches backend cache boundaries.
- **Phase 7 Polish**: Depends on selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Foundation only. Suggested MVP start.
- **US2 (P1)**: Foundation only, with dashboard integration sharing files with US1.
- **US3 (P2)**: Foundation plus trusted tier rule constraints.
- **US4 (P3)**: Foundation only; backend cache work independent from Firestore UI work.

### Parallel Opportunities

- T003, T004, and T005 can run in parallel after T001-T002 are understood.
- T010, T011, and T012 can run in parallel with T006-T009.
- US2 helper tasks T021, T026, and T027 can run in parallel after foundation.
- US3 rules tasks T031-T032 can run in parallel with UI/hook tasks T033-T037 once the contract is understood.
- US4 backend cache tasks T038-T043 can run in parallel with frontend user-state stories.
- Polish validation tasks T044, T045, T048, and T049 can run in parallel.

---

## Parallel Example: User Story 2

```text
Task: "T021 [P] [US2] Add watchlist save/remove helper functions with uppercase ticker normalization in frontend/src/lib/watchlist-storage.ts"
Task: "T026 [US2] Preserve guest risk profile only as local fallback without account writes in frontend/src/lib/risk-profile-storage.ts"
Task: "T027 [US2] Emit calculation callback data from the Zakat calculator without requiring account persistence in frontend/src/components/ZakatCalculator.tsx"
```

## Parallel Example: User Story 4

```text
Task: "T038 [US4] Audit cache key construction to ensure no user identity or preference data enters cache keys in backend/app/cache.py"
Task: "T040 [US4] Ensure stock score, halal, news, forecast, and sector route handlers use anonymous cache keys only in backend/app/api/stock.py and backend/app/api/sectors.py"
Task: "T041 [US4] Ensure gold-price/tool route handlers use anonymous cache keys only in backend/app/api/tools.py"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1 account continuity).
3. Complete the minimum dashboard-impacting tasks in Phase 4: T024, T025, T028, T029, T030.
4. Run T044 and T045 before demo.

### Incremental Delivery

1. Ship user profile continuity (US1).
2. Add watchlist/risk/Zakat continuity (US2).
3. Add private compliance alert preferences (US3).
4. Confirm backend cache boundaries (US4).
5. Finish polish and quickstart validation.

### Team Parallel Strategy

1. One developer owns Firestore rules and helper contracts: T006-T009, T031-T032.
2. One developer owns account/dashboard persistence: T013-T020, T024-T030.
3. One developer owns watchlist/risk/Zakat UI integrations: T021-T030.
4. One developer owns backend cache boundary and docs: T038-T043, T049.

---

## Notes

- [P] tasks are parallelizable because they touch different files or can proceed without waiting on incomplete task output.
- Every user story has an independent test criterion and a checkpoint.
- No task introduces a backend database, ORM, migration framework, or server-managed Firestore service account.
- Storage tasks must preserve the privacy boundary: demo-safe metadata only, no raw brokerage/payment/KYC/transaction data, and no raw Zakat input persistence.
