# Tasks: SaaS Frontend Refactor

**Input**: Design documents from `specs/002-saas-frontend-refactor/`
**Branch**: `002-saas-frontend-refactor` | **Date**: 2026-04-27
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · quickstart.md ✅ · contracts/ ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no cross-task dependencies)
- **[Story]**: User story label — [US1] through [US5] as defined in spec.md
- Exact file paths are included in every task description

---

## Phase 1: Setup

**Purpose**: Install new dependencies and scaffold new directories so all subsequent tasks can proceed.

- [x] T001 Install `framer-motion`, `focus-trap-react`, `react-hook-form`, and `zod` in `frontend/` (`npm install framer-motion@^11 focus-trap-react@^10 react-hook-form@^7 zod@^3`)
- [x] T002 [P] Create new source directories: `frontend/src/components/ui/`, `frontend/src/components/landing/`, `frontend/src/components/dashboard/`, `frontend/src/hooks/`, `frontend/src/providers/`
- [x] T003 [P] Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AUTH_COOKIE_NAME` per quickstart.md §2

**Checkpoint**: `npm run dev` starts without errors; new directories exist.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, static data, hooks, providers, all 8 UI primitives, i18n keys,
middleware, and auth page stubs. **No user story phase can begin until this phase is complete.**

> These tasks correspond to User Story 4 (Component Library, P4) which the spec
> identifies as "the foundation that makes all other stories feasible."

### Types & Static Data (parallelizable — different files)

- [x] T004 [P] Create `frontend/src/lib/auth.ts` — `UserSession`, `UserTier`, `GUEST_SESSION` constant, and `getUserFromCookie()` Server-side helper (per data-model.md §1 and research.md R-002)
- [x] T005 [P] Create `frontend/src/lib/pricing.ts` — `PRICING_PLANS` `as const` array, `PlanId` type, and `UserTier` export (per data-model.md §2 and research.md R-005)
- [x] T006 [P] Create `frontend/src/lib/services.ts` — `SERVICE_CARDS` static array of 8 `ServiceCard` objects with `requiredTier` and `available` fields (per data-model.md §3)

### Hooks & Providers (depend on T004)

- [x] T007 Create `frontend/src/hooks/useUserTier.ts` — reads `UserContext` and returns `UserTier` string; never returns null (depends on T004)
- [x] T008 Create `frontend/src/hooks/useSoftGate.ts` — fires gate once via `setTimeout(fn, 0)` after teaser renders; exposes read-only `gateOpen` boolean (per data-model.md §4 and research.md R-004)
- [x] T009 Create `frontend/src/providers/UserProvider.tsx` — RSC that calls `getUserFromCookie()`, falls back to `GUEST_SESSION`, and populates `UserContext`; exposes `UserContext` (depends on T004, T007)
- [x] T045 Create `frontend/src/components/ui/TierRefreshBanner.tsx` — dismissible warning banner rendered when `UserSession.tier` is absent or unrecognised (coerced to guest); text from `auth.refreshBanner.*` i18n key; uses `<Badge variant="warning">` and a "Refresh" button; wired into `layout.tsx` (T022) via `useUserTier()` guard (depends on T004, T007, T013)

### i18n Keys (parallelizable — different files)

- [x] T010 [P] Extend `frontend/src/messages/ar.json` — add all new namespaces: `nav`, `landing`, `auth`, `dashboard`, `gate`, `pricing`, `services`, `upgrade` (per contracts/frontend-routes.md §i18n Contract)
- [x] T011 [P] Extend `frontend/src/messages/en.json` — add same namespaces with English equivalents, matching every key in ar.json 1:1

### UI Primitives — Layer 1 (parallelizable — different files, no intra-layer deps)

- [x] T012 [P] Create `frontend/src/components/ui/Button.tsx` — variants: default/outline/ghost/destructive; sizes: sm/md/lg; `loading` prop sets `aria-disabled` + `aria-busy`; Tailwind `focus-visible:ring-*` focus indicator (per contracts/component-api.md §Button)
- [x] T013 [P] Create `frontend/src/components/ui/Badge.tsx` — variants: default/success/warning/error/outline; Tailwind only; used as primitive by TrafficLightBadge (per contracts/component-api.md §Badge)
- [x] T014 [P] Create `frontend/src/components/ui/Card.tsx` — `as` prop (div/article/section); `className` passthrough; Tailwind only (per contracts/component-api.md §Card)
- [x] T015 [P] Create `frontend/src/components/ui/SectionHeading.tsx` — `level` (h2/h3/h4), `size`, `align`; parent passes translated string; `text-start` maps to RTL-correct alignment via `tailwindcss-rtl` (per contracts/component-api.md §SectionHeading)
- [x] T016 [P] Formalize `frontend/src/components/TrafficLightBadge.tsx` props contract — add `label` (sr-only) and `size` props; ensure `aria-hidden` on decorative colour dot (per contracts/component-api.md §TrafficLightBadge)

### UI Primitives — Layer 2 (depend on Layer 1 primitives)

- [x] T017 Create `frontend/src/components/ui/Modal.tsx` — wraps `focus-trap-react`; `aria-modal="true"`, `role` prop (dialog/alertdialog); when `onClose` omitted: Escape blocked, backdrop blocked; applies `aria-inert` to siblings; `initialFocusRef` support (depends on T012; requires T001)
- [x] T018 Create `frontend/src/components/ui/PricingCard.tsx` — receives `planId` + `currentPlanId`; all text from `useTranslations('pricing')`; uses `PRICING_PLANS` for structural data; `highlighted` applies ring/shadow (depends on T005, T013, T015)
- [x] T019 Create `frontend/src/components/ui/UpgradeGate.tsx` — calls `useUserTier()` internally; renders children if tier passes; otherwise renders upgrade prompt card with `upgrade.[featureKey].*` i18n keys and CTA → `/[locale]#pricing` (landing page pricing anchor); WCAG-compliant screen reader text (depends on T007, T014)
- [x] T020 Create `frontend/src/components/ui/SignInGateModal.tsx` — extends `<Modal>` with `role="alertdialog"` and no `onClose`; two CTA links (Sign Up Free + Sign In) with `returnTo` encoded in href; focus trapped between the two CTAs only; all text from `gate.*` i18n namespace (depends on T017, T012; requires T001)

### Middleware & Layout (depend on foundational types)

- [x] T021 Update `frontend/src/middleware.ts` — add auth guard after `intlMiddleware`; define `PUBLIC_PATTERNS` regex (landing, auth/*, stock/*); add `safeReturnTo()` helper for same-origin validation; redirect unauthenticated requests to `/[locale]/auth/signin?returnTo=[encoded-path]` (depends on T004; per research.md R-007 and contracts/frontend-routes.md §Middleware Contract)
- [x] T022 Update `frontend/src/app/[locale]/layout.tsx` — wrap with `<UserProvider>`; add site navigation shell with locale-aware nav links and `<LanguageSwitcher>` (depends on T009, T010, T011)

### Auth Pages (parallelizable — different files; depend on T010/T011 for i18n)

- [x] T023 [P] Create `frontend/src/app/[locale]/auth/signin/page.tsx` — sign-in form with email/password fields; calls `safeReturnTo()` on success; all labels from `auth.*` i18n keys; keyboard-navigable form with visible focus rings (depends on T012, T010, T011)
- [x] T024 [P] Create `frontend/src/app/[locale]/auth/signup/page.tsx` — sign-up form; mirrors sign-in structure; supports `?plan=pro` query parameter for post-upgrade flow; all labels from `auth.*` i18n keys (depends on T012, T010, T011)

**Checkpoint**: All UI primitives render in isolation. Middleware redirects `/dashboard` for unauthenticated visitors. Auth pages load in both locales.

---

## Phase 3: User Story 1 — Landing Page & Pricing Discovery (Priority: P1) 🎯 MVP

**Goal**: A first-time visitor can view the full landing page with hero, features, pricing (3 plans), and footer in both Arabic (RTL) and English (LTR), tab through all interactive elements, and click a CTA to reach sign-up.

**Independent Test**: Navigate to `/ar` and `/en`. Verify hero, features, pricing section (3 cards: Free / Pro / Enterprise), and footer render. Tab through every interactive element — focus ring visible. Switch locale via language switcher — page updates without reload. All text in correct language and direction.

### Landing Page Sections (parallelizable — different files)

- [x] T025 [P] [US1] Create `frontend/src/components/landing/HeroSection.tsx` — headline, sub-headline, and primary CTA ("Get Started Free" → `/[locale]/auth/signup`); all text from `landing.hero.*` i18n keys; Framer Motion entrance animation with `useReducedMotion()` guard (depends on T012, T015)
- [x] T026 [P] [US1] Create `frontend/src/components/landing/FeaturesSection.tsx` — service feature cards using `SERVICE_CARDS` static data; `SectionHeading` for section title; all labels from `services.*` and `landing.features.*` i18n keys (depends on T006, T014, T015)
- [x] T027 [P] [US1] Create `frontend/src/components/landing/PricingSection.tsx` — renders 3 `<PricingCard>` components (free/pro/enterprise); `SectionHeading`; static disclaimer text from `pricing.disclaimer` i18n key (depends on T018, T015)
- [x] T028 [P] [US1] Create `frontend/src/components/landing/FooterSection.tsx` — site links, language switcher, copyright; all text from `landing.footer.*` i18n keys; Tailwind-only styling

### Landing Page Route

- [x] T029 [US1] Refactor `frontend/src/app/[locale]/page.tsx` — compose `<HeroSection>`, `<FeaturesSection>`, `<PricingSection>`, and `<FooterSection>`; public route (no auth check); passes no props requiring server data (depends on T025–T028)

**Checkpoint**: `/ar` and `/en` render fully. Pricing cards display all 3 plans. Language switcher toggles locale without reload. Keyboard navigation reaches all CTAs.

---

## Phase 4: User Story 2 — Authenticated Dashboard Home (Priority: P2)

**Goal**: A signed-in user sees their tier badge, all service cards, locked cards with upgrade modal, and can navigate to available features — all within 3 seconds on 3G. Free-tier users who click locked cards see an upgrade modal, not a 403.

**Independent Test**: Sign in as Free-tier user. Dashboard loads, shows tier badge, service cards render with lock icons on Pro cards. Click a locked card → `<UpgradeGate>` modal opens naming the feature and linking to pricing. Escape closes the upgrade modal and returns focus to the triggering card.

### Dashboard Components (parallelizable — different files)

- [x] T030 [P] [US2] Create `frontend/src/components/dashboard/TierBadge.tsx` — renders tier label (Free/Pro/Enterprise/Guest) from `useUserTier()`; uses `<Badge>` primitive; ARIA label includes tier value for screen readers (depends on T007, T013)
- [x] T031 [P] [US2] Create `frontend/src/components/dashboard/ServiceCardGrid.tsx` — maps `SERVICE_CARDS` to `<Card>` tiles; shows lock icon + "Upgrade" prompt for locked cards using `requiredTier` field; calls `<UpgradeGate>` on locked card activation; all labels from `services.*` and `dashboard.*` i18n keys (depends on T006, T007, T014, T019)

### Dashboard Page

- [x] T032 [US2] Create `frontend/src/app/[locale]/dashboard/page.tsx` — Server Component; calls `getUserFromCookie()` and redirects to sign-in if no session; renders `<TierBadge>` and `<ServiceCardGrid>`; passes `UserSession` as prop (depends on T004, T009, T010, T011, T030, T031)

**Checkpoint**: Dashboard loads for Free/Pro/Enterprise sessions. Locked cards show upgrade modal. No locked card causes a hard navigation. Escape closes `<UpgradeGate>` modal and returns focus.

---

## Phase 5: User Story 5 — Soft Sign-In Gate: Try Then Wall (Priority: P2)

**Goal**: An unauthenticated visitor to any stock detail page sees the teaser (Traffic Light badge + Halal verdict + disclaimer + company name/ticker), then a non-dismissible `<SignInGateModal>` appears within 300 ms. If the teaser API fails, an inline error shows and the gate does NOT open.

**Independent Test**: Navigate to `/ar/stock/AAPL` without a session cookie. Teaser renders (4 elements visible, including Halal disclaimer). Modal appears ≤ 300 ms after render. Escape key, backdrop click, and Tab outside the modal: all no-ops. Tab cycles only between "Sign Up Free" and "Sign In" CTAs. Inspect background — `aria-inert="true"` on all page-level siblings of the modal. Sign Up CTA URL contains `?returnTo=/ar/stock/AAPL`.

### Stock Detail Page Soft Gate

- [x] T033a [US5] Refactor `frontend/src/app/[locale]/stock/[ticker]/page.tsx` — implement teaser render for `tier === 'guest'`: exactly 4 elements per FR-017: (1) `<TrafficLightBadge>`, (2) Halal verdict label, (3) stock name/ticker, (4) mandatory Halal disclaimer from `gate.halalDisclaimer` i18n key (Constitution Principle IV); render Pro-tier sections inside `<UpgradeGate>` for authenticated users; render inline error + "Try again" button from `gate.teaserError` i18n key when teaser fetch fails (gate suppressed on error) (depends on T016, T019, T010, T011)
- [x] T033b [US5] Add soft gate trigger and full-page inert to `frontend/src/app/[locale]/stock/[ticker]/page.tsx` — call `useSoftGate(!!teaserData && tier === 'guest')`; render `<SignInGateModal isOpen={gateOpen} returnTo={pathname}>`; apply `aria-inert="true"` on all page-level sibling containers of the modal (full-page inert per FR-018, not only the teaser container); verify Escape and backdrop do not close the modal; verify Tab cycles only between the two CTA links (depends on T033a, T008, T020)

**Checkpoint**: Unauthenticated visit shows all 4 teaser elements including Halal disclaimer. Modal appears ≤300ms. Escape/backdrop have no effect. All background page siblings are `aria-inert`. CTA hrefs contain `returnTo`. Fetch-failure shows error, no modal. Authenticated Free/Pro users see appropriate gated content.

---

## Phase 6: User Story 3 — Tier-Gated Feature Pages (Priority: P3)

**Goal**: Free-tier users who navigate directly to any Pro feature (ARIMA chart, Risk Panel, Allocator, Sector Explorer, full News feed) see an upgrade prompt instead of a blank page or error. Pro-tier users see full content.

**Independent Test**: Sign in as Free-tier user. Navigate to `/[locale]/stock/[ticker]`, scroll to ARIMA section — `<UpgradeGate>` renders upgrade prompt with feature description and "Upgrade to Pro" link. No console errors. Screen reader reads "This feature is available on the Pro plan." in the active locale.

### Existing Component Wrappers (parallelizable — different files)

- [x] T034 [P] [US3] Wrap `frontend/src/components/ArimaChart.tsx` with `<UpgradeGate requiredTier="pro" featureKey="arima">` — gate renders for Free/Guest tier; Pro/Enterprise sees chart; i18n key `upgrade.arima.*` (depends on T019)
- [x] T035 [P] [US3] Wrap `frontend/src/components/RiskPanel.tsx` with `<UpgradeGate requiredTier="pro" featureKey="risk">` — gate for Free/Guest; i18n key `upgrade.risk.*` (depends on T019)
- [x] T036 [P] [US3] Wrap `frontend/src/components/AllocatorForm.tsx` with `<UpgradeGate requiredTier="pro" featureKey="allocator">` — gate for Free/Guest; i18n key `upgrade.allocator.*` (depends on T019)
- [x] T037 [P] [US3] Wrap `frontend/src/components/SectorPanel.tsx` with `<UpgradeGate requiredTier="pro" featureKey="sector">` — gate for Free/Guest; i18n key `upgrade.sector.*` (depends on T019)
- [x] T038 [US3] Update `frontend/src/components/NewsPanel.tsx` — cap news items at 3 for `free`/`guest` tier; show `<UpgradeGate requiredTier="pro" featureKey="news">` below the 3rd headline; Pro+ sees full feed (depends on T007, T019)

**Checkpoint**: Free-tier user sees upgrade prompt on all Pro sections. Pro-tier user sees full content. No 403 errors, no missing ARIA labels on upgrade prompts.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, motion, security, and i18n completeness audit across all stories.

- [x] T039 [P] Audit all `<motion.*>` usages across `frontend/src/components/` — verify every animation uses `useReducedMotion()` guard from Framer Motion and substitutes `{}` variants when `prefersReducedMotion === true` (per research.md R-006)
- [x] T040 [P] Verify `safeReturnTo()` in `frontend/src/middleware.ts` — ensure `new URL(raw, origin).origin === origin` check is present and all `returnTo` redirect paths fall back to `/[locale]/dashboard` on failure (per research.md R-003 and contracts/frontend-routes.md §returnTo Contract)
- [x] T041 [P] Cross-check `frontend/src/messages/ar.json` and `frontend/src/messages/en.json` — confirm every key present in one file exists in the other; no `[MISSING_KEY]` placeholders in either locale
- [x] T042 [P] Verify WCAG 2.1 AA compliance across all UI primitives and pages — confirm `aria-live="polite"` on all dynamic regions, `role="status"` on loaders, `focus-visible:ring-*` on all interactive elements, `alt`/`aria-hidden` on all images and icons
- [x] T043 Validate tier coercion in `frontend/src/lib/auth.ts` — unknown JWT `tier` values default to `'guest'`; unknown `locale` values default to `'ar'`; run manual test with tampered JWT payload
- [x] T044 Run full quickstart.md validation — verify all 8 routes load (landing, auth/signin, auth/signup, dashboard, stock/[ticker]), no console errors in English and Arabic locale, language switcher updates all text without reload

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all phases below
    ↓
Phase 3 (US1 — P1)  Phase 4 (US2 — P2)  Phase 5 (US5 — P2)  Phase 6 (US3 — P3)
    ↓                   ↓                   ↓                   ↓
Phase 7 (Polish) ← all user story phases must complete first
```

### User Story Dependencies

| Story | Depends on Phase | Blocks | Notes |
|-------|-----------------|--------|-------|
| US1 — Landing Page (P1) | Phase 2 complete | Nothing | Can start immediately after foundational |
| US2 — Dashboard (P2) | Phase 2 complete | Nothing | Independent of US1 |
| US5 — Soft Gate (P2) | Phase 2 complete | Nothing | Independent of US1/US2 |
| US3 — Tier Gating (P3) | Phase 2 complete (T019) | Nothing | Independent of US1/US2/US5 |

Phases 3–6 can proceed **in parallel across team members** once Phase 2 is complete.

### Within Each Phase

- Types/static data tasks (T004–T006) → start of Phase 2
- Hooks/providers (T007–T009) → after T004
- UI primitives Layer 1 (T012–T016) → after T004 for type imports
- UI primitives Layer 2 (T017–T020) → after Layer 1
- Middleware + layout (T021–T022) → after T004
- Auth pages (T023–T024) → after T010/T011 (i18n keys)

---

## Parallel Opportunities

### Phase 2 — Foundational

```
T004, T005, T006           → run together (types & static data)
T010, T011                 → run together (i18n — ar + en)
T012, T013, T014, T015, T016  → run together after T004 (UI primitives layer 1)
T017, T018, T019, T020    → run layer 2 after layer 1 (T017 needs T012, etc.)
T023, T024                 → run together after T010/T011 (auth pages)
```

### Phase 3 — US1 Landing Page

```
T025, T026, T027, T028    → run together (landing sections — different files)
T029                       → after T025–T028 (compose sections in page)
```

### Phase 4 — US2 Dashboard

```
T030, T031    → run together (dashboard components)
T032          → after T030, T031
```

### Phase 6 — US3 Tier Gating

```
T034, T035, T036, T037    → run together (different component files)
T038                       → independent of T034–T037
```

---

## Implementation Strategy

### MVP (User Story 1 — Landing Page only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T024) — component library is the hardest phase; invest here
3. Complete Phase 3: US1 Landing Page (T025–T029)
4. **STOP and VALIDATE**: Landing page accessible at `/ar` and `/en`, pricing cards visible, keyboard nav working
5. Deploy as static marketing page if needed

### Incremental Delivery (hackathon order)

1. Setup + Foundational → entire component library + auth stubs ready
2. US1 (Landing) → marketing-ready; public demo works
3. US2 (Dashboard) + US5 (Soft Gate) in parallel → authenticated product demo
4. US3 (Tier Gating) → upgrade path complete
5. Polish → demo-day quality gate

### Team Assignment Suggestion (4 members)

After Phase 2 complete:
- **Frontend Lead**: US5 (Soft Gate) — highest-risk story (FR-018/FR-019)
- **UX/Accessibility**: US1 (Landing Page) — visual polish + RTL
- **Backend (JWT)**: US2 (Dashboard) — tier badge + service cards
- **AI/Integration**: US3 (Tier Gating) — wrapping existing feature components

---

## Notes

- **[P]** = different files, no unresolved dependencies — safe to parallelize within the same phase
- **Story labels** [US1]–[US5] map to user stories in spec.md (note: spec.md numbers stories 1, 2, 5, 4, 3 — labels here follow spec numbering for traceability)
- **US4 (Component Library, P4)** is implemented entirely in Phase 2 (Foundational) because the spec explicitly designates it as the shared foundation
- **FR-018/FR-019** (soft gate, 300 ms trigger, non-dismissible) are the highest-risk requirements — allocate extra review time to T020 and T033
- **`returnTo` security** (T040) is safety-critical — open redirect prevention must be verified before any deploy
- **Framer Motion** (T001) is not yet installed; T025/T028 must not use `motion.*` imports before T001 completes
