# Implementation Plan: Firestore MVP User Storage

**Branch**: `005-firestore-mvp-storage` | **Date**: 2026-05-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-firestore-mvp-storage/spec.md`

**Note**: This plan follows Constitution v1.4.0, especially Principle XII
(MVP Data Persistence & Cache Strategy).

## Summary

Formalize the MVP persistence boundary for Sahim: Firestore stores only
owner-scoped, demo-safe user state, while backend market/news/halal/forecast/
sector/gold service responses remain in the existing in-memory TTL cache.
The feature covers user profile metadata, onboarding summary, watchlist,
latest risk profile, latest Zakat reminder metadata, compliance alert
preferences, Firestore owner-only rules, and documentation for what must stay
out of MVP storage.

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 14 frontend; Python 3.11 / FastAPI backend  
**Primary Dependencies**: Firebase Auth + Firestore client SDK, Next.js App Router,
next-intl, Tailwind CSS, FastAPI, cachetools TTLCache  
**Storage**: Firestore for user-owned MVP state under `users/{uid}`; browser
localStorage only for guest fallback; backend in-memory TTL cache for service data  
**Testing**: `npx tsc --noEmit --pretty false`, `npm run build`, manual Firebase
rules validation with two accounts, backend cache smoke checks via existing API calls  
**Target Platform**: Netlify frontend + Render.com FastAPI backend; Firebase project for Auth/Firestore  
**Project Type**: Full-stack SaaS web application  
**Performance Goals**: Dashboard user-state hydration visible within 3 seconds for
95% of signed-in demo users; repeated service lookups reuse cache within the
documented TTL window; storage-unavailable flows preserve current user workflow  
**Constraints**: No brokerage credentials, KYC documents, payment methods, real
transactions, raw Zakat inputs, or persistent provider-response history in MVP
storage; owner-only Firestore rules; Pro alert writes enforced by server-side
Firestore rules, not cosmetic UI alone; Arabic/English localized storage states  
**Scale/Scope**: Hackathon MVP; 100 concurrent demo users; lightweight per-user
documents and subcollections; no backend database, ORM, migrations, or
server-managed Firestore service account

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Demo-Day First | Is the storage work small enough to support the May 1 demo without new infrastructure? | PASS - uses existing Firebase and backend cache only |
| II. MVP Vertical Slices | Does each persisted state support an existing user-visible slice? | PASS - dashboard, risk, Zakat, watchlist, and alerts are covered end-to-end |
| III. Arabic-First | Are storage states, warnings, and prompts localized? | PASS - plan requires Arabic/English messages for empty/error/upgrade states |
| IV. Halal Integrity | Do compliance alert records avoid becoming religious rulings? | PASS - they store preferences and last-known status only; verdict disclaimers stay in UI |
| V. Regulatory Compliance | Does stored data avoid implying investment advice? | PASS - only user state and metadata are stored; score/projection disclaimers remain mandatory |
| VI. Graceful Degradation | Can user-owned data remain readable when provider/cache data fails? | PASS - cache failures do not block Firestore user state reads |
| VII. Security & Data Privacy | Are stored records minimal, owner-scoped, and free of sensitive financial data? | PASS - data boundary excludes raw brokerage/payment/KYC/transaction data |
| VIII. SaaS Architecture | Are tier-gated alert writes server-enforced? | PASS - Firestore rules must prevent user self-promotion and allow alert writes only for trusted Pro/Enterprise tier |
| IX. Component & Accessibility | Are storage-dependent UI states accessible? | PASS - loading, saved, unavailable, and upgrade states must be keyboard/screen-reader friendly |
| X. Competitive Differentiation | Does persistence serve Arabic-first, halal-native beginner guidance? | PASS - saved risk, Zakat, halal alerts, and watchlist reinforce the product advantage |
| XI. Dashboard Design | Does persisted data support dashboard zones without altering layout standards? | PASS - KPI/watchlist/risk/Zakat fields feed existing dashboard zones |
| XII. MVP Data Persistence | Are Firestore and TTL cache boundaries exactly aligned with Principle XII? | PASS - Firestore for user state, in-memory TTL cache for service data |

**Gate result**: All gates pass. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/005-firestore-mvp-storage/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── firestore-data-contract.md
│   └── backend-cache-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
firestore.rules                         # Owner-only user storage and tier rule boundary
docs/
└── mvp-storage.md                      # Human-readable storage setup and schema map

frontend/
├── .env.local.example                  # Firebase public config variables
└── src/
    ├── lib/
    │   ├── firebase.ts                 # Firebase app/auth/firestore initialization
    │   ├── firebase-session.ts         # Client auth/tier/profile session helpers
    │   ├── firestore-user.ts           # User document merge helpers
    │   ├── risk-profile-storage.ts     # Guest localStorage fallback
    │   └── types.ts                    # Shared data types
    ├── hooks/
    │   ├── useDashboardKPI.ts
    │   ├── useLastViewedTicker.ts
    │   ├── useWatchlist.ts
    │   └── useComplianceAlerts.ts
    ├── components/
    │   ├── ZakatCalculator.tsx
    │   ├── RiskWizard.tsx
    │   ├── ComplianceAlertToggle.tsx
    │   └── dashboard/
    │       ├── DashboardAlertsBanner.tsx
    │       └── DashboardOnboardingChecklist.tsx
    └── app/[locale]/
        ├── auth/signin/page.tsx
        ├── auth/signup/page.tsx
        ├── dashboard/page.tsx
        ├── stock/[ticker]/page.tsx
        └── tools/
            ├── risk-wizard/page.tsx
            └── zakat/page.tsx

backend/
└── app/
    ├── cache.py                        # In-memory service response TTL cache
    ├── api/                            # Existing stock/tool/sector endpoints
    └── services/                       # Existing provider adapters and calculators
```

**Structure Decision**: Keep the web app split already used by the repository.
Firestore stays in frontend client flows and security rules for MVP user state.
The FastAPI backend remains stateless except for the existing process-local TTL
cache. No new backend database or migration directory is introduced.

## Phase 0: Research Summary

See [research.md](research.md). Key decisions:

- Firestore remains the MVP user data store because it is already paired with
  Firebase Auth in the app.
- Tier-sensitive alert writes are enforced in Firestore rules using a trusted
  tier field that users cannot self-promote.
- Backend provider responses remain in memory-only TTL caches.
- Guest risk profile fallback remains local-only and never becomes durable
  account data until an authenticated user explicitly completes or saves a flow.

## Phase 1: Design & Contracts

Generated artifacts:

- [data-model.md](data-model.md) - entities, fields, relationships, validation,
  and state transitions
- [contracts/firestore-data-contract.md](contracts/firestore-data-contract.md)
  - Firestore document paths, allowed writers, tier rule expectations
- [contracts/backend-cache-contract.md](contracts/backend-cache-contract.md)
  - cache key shape, TTL boundaries, privacy constraints
- [quickstart.md](quickstart.md) - Firebase setup and validation workflow

## Post-Design Constitution Re-Check

| Principle | Result |
|-----------|--------|
| I-II | PASS - planning artifacts preserve narrow MVP scope and map storage to visible slices |
| III-V | PASS - no disclaimer-bearing outputs are stored without UI disclaimer obligations |
| VI | PASS - service cache failure and user persistence failure have independent fallbacks |
| VII | PASS - contracts exclude sensitive financial/KYC/payment/brokerage data |
| VIII | PASS - Firestore rules contract forbids tier self-promotion and gates Pro alert writes |
| IX | PASS - quickstart includes localized accessible states validation |
| X-XI | PASS - dashboard data supports existing prioritized zones and beginner-safe workflows |
| XII | PASS - Firestore user state and backend TTL cache boundaries are explicit |

## Complexity Tracking

No constitution violations. No additional complexity justification required.
