# Tasks: Premium Dashboard Refactor

**Input**: Design documents from `specs/004-dashboard-refactor/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅
**Branch**: `004-dashboard-refactor`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no deps on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install missing dependency, extend type definitions, and seed i18n keys so all subsequent phases compile.

- [x] T001 Install `chart.js` and `react-chartjs-2` in `frontend/` — run `npm install chart.js react-chartjs-2` and verify package.json additions
- [x] T002 [P] Add `DashboardKPI`, `DashboardNewsItem`, `ArimaChartPoint`, `SectorBar`, `RiskGaugeData`, and `ServiceCard` (updated) types to `frontend/src/lib/types.ts`
- [x] T003 [P] Add all dashboard i18n keys (KPI card labels, empty-state messages, chart titles, tier badge text, CTA labels) under `dashboard.*` namespace to `frontend/src/messages/ar.json` and `frontend/src/messages/en.json`

**Checkpoint**: ✅ PASSED — `npm run build` compiles with no missing-type or missing-translation errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story component is created.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Create Chart.js global component registry in `frontend/src/lib/chartjs-registry.ts` — register `LineElement`, `PointElement`, `LinearScale`, `CategoryScale`, `BarElement`, `ArcElement`, `Tooltip`, `Legend`, `Filler` so all dashboard chart components can import from one place
- [x] T005 [P] Update `frontend/src/lib/services.ts` — replace the current 8-card `SERVICES` array with a 9-card array in the required priority order (Stock Screener → Halal Verdict → Risk Wizard → ARIMA Forecast → Portfolio Allocator → Risk Dashboard → Sector Explorer → News Agent → Zakat Calculator) with correct `href` values and `requiredTier` assignments; add `risk-wizard` and `zakat-calculator` entries
- [x] T006 [P] Create `useWatchlist` hook in `frontend/src/hooks/useWatchlist.ts` — reads `users/{uid}/watchlist` subcollection from Firestore, returns `{ tickers: string[], loading: boolean }`
- [x] T007 [P] Create `useDashboardKPI` hook in `frontend/src/hooks/useDashboardKPI.ts` — reads Firestore user doc for `watchlistCount`, `halalComplianceRate`, `riskProfile`, `lastZakatDate`, `lastViewedTicker`; returns `{ kpi: DashboardKPI, loading: boolean }`
- [x] T008 [P] Create `useLastViewedTicker` hook in `frontend/src/hooks/useLastViewedTicker.ts` — reads and writes `lastViewedTicker` field on the Firestore user doc `users/{uid}`; returns `{ ticker: string, setTicker: (t: string) => void }`
- [x] T009 [P] Create shared Framer Motion variant `fadeInUp` and `staggerContainer` in `frontend/src/lib/motion.ts`

**Checkpoint**: ✅ PASSED — All hooks compile; `useWatchlist` returns correctly typed data when connected to a test Firestore user doc

---

## Phase 3: User Story 1 — First-Time Post-Login Overview (Priority: P1) 🎯 MVP

**Goal**: A new user lands on the dashboard and immediately sees all 6 layout zones with appropriate empty-state fallbacks. No prior activity required.

**Independent Test**: Sign in with a Free-tier account with an empty watchlist and no risk profile. Load `/ar/dashboard`. Verify Zone 1 renders the scrolling ticker strip, Zone 2 shows zero-state KPI cards (لا توجد أسهم, احسب الآن, لم يُحدَّد بعد), Zone 3 shows ARIMA fallback (AAPL, 7-day) and portfolio placeholder text, Zone 4 shows all 9 service cards, and Zones 5–6 render graceful empty states.

- [x] T010 [P] [US1] Update `frontend/src/components/TickerStrip.tsx` — add `onTickerClick?: (symbol: string) => void` prop; wrap each ticker item as `<div role="button" tabIndex={0} onKeyDown={...}>` so clicking or pressing Enter/Space calls `onTickerClick(symbol)` to update the Zone 3 ARIMA chart **without page navigation** (per FR-004 clarification); add an inline Halal status badge per ticker with a tooltip referencing the Principle IV disclaimer (implemented fully in T044)
- [x] T011 [P] [US1] Create `DashboardKPICard` component in `frontend/src/components/dashboard/DashboardKPICard.tsx` — accepts `label`, `value`, `subtitle`, `icon`, `cta?: { label: string, href: string }`, `loading` props; renders gold icon, primary value, subtitle, and optional CTA link with animate-pulse skeleton when `loading` is true
- [x] T012 [P] [US1] Create `DashboardZone` wrapper component in `frontend/src/components/dashboard/DashboardZone.tsx` — accepts `title?`, `loading`, `children`; renders `animate-pulse` Tailwind skeleton placeholder during loading, then fades in children
- [x] T013 [US1] Create `DashboardArimaChart` component in `frontend/src/components/dashboard/DashboardArimaChart.tsx` — Chart.js `Line` chart using `react-chartjs-2` with confidence-interval shading (three datasets: `price`, `ci_upper`, `ci_lower`); accepts `data: ArimaChartPoint[]`, `ticker: string`, `loading: boolean`; imports from chartjs-registry (T004); renders skeleton when loading
- [x] T014 [P] [US1] Create `DashboardPortfolioChart` component in `frontend/src/components/dashboard/DashboardPortfolioChart.tsx` — Chart.js `Doughnut` chart; accepts `sectors: Array<{ sector: string, value: number }>`, `loading: boolean`; renders `أضف أسهمك لرؤية التوزيع` placeholder text when sectors array is empty; gold/accent color palette
- [x] T015 [US1] Update `frontend/src/components/dashboard/ServiceCardGrid.tsx` — add icon entries for `risk-wizard` and `zakat-calculator` to `iconMap`; update `featureKeyMap` for new Pro services; ensure grid renders all 9 cards from updated `SERVICES` (T005) in order with existing `UpgradeGate` lock overlay for Pro-gated cards
- [x] T016 [US1] Refactor `frontend/src/app/[locale]/dashboard/page.tsx` — replace current `max-w-5xl` single-column layout with a 12-column responsive CSS grid; wire Zone 1 (`TickerStrip` with `onTickerClick` state), Zone 2 (4× `DashboardKPICard` with loading placeholders), Zone 3 (7-col: `DashboardArimaChart` + 5-col: `DashboardPortfolioChart`), Zone 4 (`ServiceCardGrid`); apply `fadeInUp` stagger between zones using `DashboardZone`

**Checkpoint**: ✅ PASSED — US1 fully testable — empty-state new user sees all 4 wired zones (1–4) with correct loading fallbacks; Zones 5–6 are scaffolded and wired in Phase 4

---

## Phase 4: User Story 2 — Returning User Daily Market Check (Priority: P1)

**Goal**: A Pro user with watchlist and risk profile sees live ARIMA chart, sector performance, risk gauge, and ranked news without navigating away from the dashboard.

**Independent Test**: Sign in with a Pro account with ≥3 watchlist tickers and a completed Risk Wizard profile. Verify Zone 3 defaults to `lastViewedTicker` with 30-day ARIMA data, Zone 5 shows sector bars and a risk gauge arc, and Zone 6 shows 6 news headlines sorted by recency.

- [x] T017 [P] [US2] Create `useDashboardArima` hook in `frontend/src/hooks/useDashboardArima.ts` — wraps `getArima()` from `api.ts`; accepts `ticker: string` and `horizon: 7 | 30`; returns `{ data: ArimaChartPoint[], loading: boolean, error: boolean }`; silently retries on failure; returns empty array on persistent error
- [x] T018 [P] [US2] Create `useSectorPerformance` hook in `frontend/src/hooks/useSectorPerformance.ts` — wraps `getSectors()` from `api.ts`; accepts `period: 'week' | 'month' | 'quarter'`; returns `{ sectors: SectorBar[], loading: boolean }`
- [x] T019 [P] [US2] Create `useDashboardNews` hook in `frontend/src/hooks/useDashboardNews.ts` — accepts `tickers: string[]` and `limit: 3 | 6`; calls `getNews()` per ticker, merges results, sorts by `timestamp` descending, slices to `limit`; returns `{ items: DashboardNewsItem[], loading: boolean }`
- [x] T020 [US2] Wire `useDashboardArima` into `DashboardArimaChart.tsx` — accept `ticker` prop driven by `onTickerClick` state from `TickerStrip`; default to `lastViewedTicker` from `useDashboardKPI`; display selected ticker symbol as chart card title
- [x] T021 [US2] Wire `useDashboardKPI` (T007) data into the 4 `DashboardKPICard` instances in `frontend/src/app/[locale]/dashboard/page.tsx` — Watchlist Size, Halal Compliance Rate, Risk Level (with Risk Wizard CTA when null), Zakat Reminder (with Zakat Calculator CTA when no date)
- [x] T022 [P] [US2] Create `DashboardSectorChart` component in `frontend/src/components/dashboard/DashboardSectorChart.tsx` — Chart.js horizontal `Bar` chart; accepts `sectors: SectorBar[]`, `period: 'week' | 'month' | 'quarter'`, `onPeriodChange`, `loading`; abbreviated Arabic sector names on Y-axis; green bars for positive %, red for negative; renders skeleton when loading
- [x] T023 [P] [US2] Create `DashboardRiskGauge` component in `frontend/src/components/dashboard/DashboardRiskGauge.tsx` — Chart.js half-doughnut (`Doughnut` with `circumference: Math.PI`, `rotation: Math.PI`); three arc segments: green (0–33), amber (34–66), red (67–100); needle/pointer overlay via canvas plugin or CSS; renders greyed-out arc at 0 with overlay `اكتشف مستوى مخاطرتك` and CTA to `/{locale}/tools/risk-wizard` when `score` is null
- [x] T024 [P] [US2] Create `DashboardNewsCard` component in `frontend/src/components/dashboard/DashboardNewsCard.tsx` — accepts `item: DashboardNewsItem`; renders ticker symbol, inline Halal badge, Arabic headline (2-line `line-clamp-2`), source, relative timestamp, and `اقرأ المزيد` link to `/{locale}/stock/{ticker}` via `next/link`
- [x] T025 [US2] Create `DashboardNewsFeed` component in `frontend/src/components/dashboard/DashboardNewsFeed.tsx` — renders grid of `DashboardNewsCard` items from `useDashboardNews`; shows `أضف أسهماً لمتابعة أخبارها` empty-state when watchlist is empty; handles partial results (shows only available headlines up to limit)
- [x] T026 [US2] Wire Zones 5 and 6 into `frontend/src/app/[locale]/dashboard/page.tsx` — Zone 5 (7-col: `DashboardSectorChart` with period toggle state + 5-col: `DashboardRiskGauge`); Zone 6 (`DashboardNewsFeed`); both wrapped in `DashboardZone`
- [x] T027 [US2] Write `lastViewedTicker` to Firestore on stock page visit — update `frontend/src/app/[locale]/stock/[ticker]/page.tsx` (or the stock detail client component) to call `useLastViewedTicker().setTicker(ticker)` on mount

**Checkpoint**: ✅ PASSED Phase 4 — US2 fully wired — live ARIMA chart, sector performance, risk gauge, and news feed integrated with selectedTicker state and Firestore persistence.

---

## Phase 5: User Story 3 — Free User Discovering Pro Features (Priority: P2)

**Goal**: Free-tier users see soft upgrade prompts for Pro-gated features without any broken or empty UI sections. At least 2 visible upgrade prompts on the dashboard.

**Independent Test**: Sign in with a Free-tier account. Verify ARIMA chart shows 7-day data with upgrade banner, Sector chart shows weekly-only with greyed month/3m toggles and "برو" badge, News Feed shows exactly 3 cards with "اشترك في برو لرؤية المزيد" note, and Pro service cards show semi-transparent "ترقِّ للوصول" overlay.

- [x] T028 [P] [US3] Create `UpgradeOverlay` component in `frontend/src/components/dashboard/UpgradeOverlay.tsx` — renders semi-transparent dark overlay with `ترقِّ للوصول` text and upgrade `next/link` button to `/{locale}/pricing`; accepts `visible: boolean`; accessible with `aria-label="متاح للمشتركين في برو فقط"`
- [x] T029 [US3] Add Free-tier ARIMA limit and upgrade banner to `DashboardArimaChart.tsx` — when `tier === 'free'`, enforce `horizon: 7`, display bottom banner `وسِّع الأفق إلى 30 يوماً — ترقَّ إلى برو` with link to `/{locale}/pricing`
- [x] T030 [US3] Add sector timeframe toggle greyed-out state to `DashboardSectorChart.tsx` — when `tier === 'free'`, render "شهر" and "3 أشهر" toggle buttons as disabled with a "برو" badge; clicking them navigates to `/{locale}/pricing` instead of changing the chart
- [x] T031 [US3] Enforce tier-based news limit in `DashboardNewsFeed.tsx` — when `tier === 'free'`, cap display at 3 items and append a `اشترك في برو لرؤية المزيد` note below the last card; no blank placeholder slots
- [x] T032 [US3] Apply `UpgradeOverlay` (T028) onto Pro-gated service cards in `ServiceCardGrid.tsx` replacing current `UpgradeGate`; pass `tier` prop from `useUserTier()` into `DashboardArimaChart`, `DashboardSectorChart`, `DashboardNewsFeed` in `frontend/src/app/[locale]/dashboard/page.tsx`

**Checkpoint**: ✅ PASSED — US3 fully testable; free-tier gating overlays and upgrade prompts are active across ARIMA, Sector, News, and service cards.

---

## Phase 6: User Story 4 — Navigation to Service Pages (Priority: P2)

**Goal**: Every service card, KPI CTA, news card link, and ticker strip link routes to the correct page with the active locale prefix.

**Independent Test**: Click each of the 9 service cards, both KPI CTAs (Risk Wizard, Zakat Calculator), a news card "اقرأ المزيد" link, and a ticker strip item. Verify each navigates to the correct `/{locale}/...` route.

- [x] T033 [P] [US4] Verify correct `href` values for all 9 service cards in `frontend/src/lib/services.ts` — set: `stock-screener → /stock`, `halal-verdict → /stock`, `risk-wizard → /tools/risk-wizard`, `arima-forecast → /stock`, `portfolio-allocator → /tools/allocator`, `risk-dashboard → /tools/risk`, `sector-explorer → /sectors`, `news-agent → /stock`, `zakat-calculator → /tools/zakat`; locale prefix is added by `ServiceCardGrid` via `useLocale()`
- [x] T034 [P] [US4] Ensure `DashboardKPICard.tsx` CTA `href` values are locale-prefixed — use `useLocale()` inside the component and prefix the `cta.href` with `/${locale}` before passing to `next/link`
- [x] T035 [P] [US4] Ensure `DashboardNewsCard.tsx` `اقرأ المزيد` link is locale-prefixed — build href as `/${locale}/stock/${item.ticker}` via `useLocale()` and `next/link`
- [x] T036 [US4] Add `"\u0634\u0627\u0647\u062f \u0627\u0644\u062a\u0648\u0642\u0639\u0627\u062a \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u2190"` CTA `next/link` to `DashboardArimaChart.tsx` card footer — render a locale-prefixed link `/{locale}/stock/{ticker}` as the canonical stock-page navigation path from Zone 3; this avoids invalid `<a>`-inside-`<a>` nesting and the unreliable `stopPropagation` pattern; confirm `TickerStrip` ticker items have no nested `<a>` element

**Checkpoint**: ✅ PASSED — US4 fully testable; service cards, KPI CTAs, ARIMA footer CTA, and news links are locale-prefixed and routing correctly.

---

## Phase 7: User Story 5 — Arabic RTL Dashboard Experience (Priority: P2)

**Goal**: With the `ar` locale active, the full dashboard renders right-to-left — layout columns mirror, chart labels flip, and all text is in Arabic.

**Independent Test**: Set locale to `ar`. Verify Zone 3 and Zone 5 column order is mirrored (chart on right, secondary panel on left), chart legends align RTL, all labels are Arabic, and layout holds at 360px and 1280px.

- [x] T037 [P] [US5] Add RTL chart config to `DashboardArimaChart.tsx`, `DashboardPortfolioChart.tsx`, `DashboardSectorChart.tsx`, `DashboardRiskGauge.tsx` — accept `locale: string` prop; when `locale === 'ar'`, set Chart.js `rtl: true` on legend, reverse the X-axis, and apply Cairo font family (`font: { family: 'Cairo' }`)
- [x] T038 [P] [US5] Mirror Zone 3 and Zone 5 column order for RTL in `frontend/src/app/[locale]/dashboard/page.tsx` — when `locale === 'ar'`, apply `flex-row-reverse` or a mirrored grid layout so Zone 3 (ARIMA 7-col) is on the right and Portfolio (5-col) is on the left, and similarly for Zone 5
- [x] T039 [US5] Audit all dashboard components for hardcoded English text — ensure every user-visible string uses `useTranslations('dashboard')` and that `ar.json` has an Arabic translation for every key added in T003

**Checkpoint**: ✅ PASSED — US5 fully testable; `/ar/dashboard` renders mirrored Zone 3/5 layout, RTL-aware chart labeling, and localized dashboard strings.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Animations, accessibility, skeleton correctness, and responsive validation.

- [x] T040 [P] Audit all `DashboardZone` usages in `frontend/src/app/[locale]/dashboard/page.tsx` and individual chart components — confirm every data-fetching zone shows `animate-pulse` skeleton within ≤100ms of navigation; no spinners, no error toasts on transient failures
- [x] T041 [P] Add `aria-label` to every chart container (`<div role="img" aria-label="...">`) in `DashboardArimaChart.tsx`, `DashboardPortfolioChart.tsx`, `DashboardSectorChart.tsx`, `DashboardRiskGauge.tsx`; add `tabIndex={0}` and `role="button"` to all interactive cards and CTA links; verify keyboard Tab/Enter/Space navigation works across all zones
- [x] T042 [P] Apply Framer Motion `staggerContainer` + `fadeInUp` (T009) to zone entry in `frontend/src/app/[locale]/dashboard/page.tsx` (0.1s stagger between zones) and to service card entry in `ServiceCardGrid.tsx` (0.05s stagger between cards)
- [x] T043 Validate responsive layout at 360px, 768px, 1280px, and 1440px viewports in `frontend/src/app/[locale]/dashboard/page.tsx` — fix any text overflow, chart clipping, service card stack order, or zone mis-stacking; confirm charts maintain minimum 200px height on mobile; run `npx next build` and measure LCP ≤3s on `/[locale]/dashboard` (SC-003 verification — use `next/bundle-analyzer` or browser DevTools Lighthouse if CI is unavailable)

**Checkpoint**: Full dashboard passes visual QA at all viewports, all interactions are keyboard-accessible, all zones show skeletons during load; LCP ≤3s confirmed

---

## Phase 9: Compliance & Data Completeness

**Purpose**: Implement mandatory constitution-required disclaimers (Principles IV and V) and the missing portfolio data hook that supplies Zone 3’s doughnut chart. These tasks can run in parallel with Phase 5+ once Phase 4 components exist.

- [x] T044 [P] Add Halal disclaimer tooltip to `TickerStrip.tsx` inline badges and `DashboardNewsCard.tsx` Halal badges — render an accessible tooltip (`role="tooltip"`, `aria-describedby`) containing `"التحقق النهائي من الحلية يقع على عاتق المستخدم"` on each badge; verify keyboard focusability and screen reader announcement (FR-018 / Principle IV)
- [x] T045 [P] Add investment-advice disclaimer footer to `DashboardArimaChart.tsx` and `DashboardRiskGauge.tsx` — render `"تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"` as a non-removable `<p>` below each chart; style `text-white/40 text-xs` for WCAG AA contrast on dark background; add i18n key `dashboard.disclaimer.investmentAdvice` to `ar.json` and `en.json` (FR-019 / Principle V)
- [x] T046 [P] Create `useDashboardPortfolio` hook in `frontend/src/hooks/useDashboardPortfolio.ts` — for each ticker in `useWatchlist`, look up sector from the existing `/sectors` endpoint response (or a cached sector map); aggregate tickers by sector and compute value counts; return `{ sectors: Array<{ sector: string; value: number }>, loading: boolean }`; wire into `DashboardPortfolioChart` in `page.tsx` replacing the empty-array placeholder (FR-005 / E1 fix)

**Checkpoint**: All Principle IV and V disclaimers present and screen-reader accessible; portfolio doughnut receives real sector data from `useDashboardPortfolio`; `npm run build` still passes

---

## Dependencies (Story Completion Order)

```
Phase 1 (T001–T003)
  └── Phase 2 (T004–T009)
        ├── Phase 3 / US1 (T010–T016)  🎯 MVP — can ship independently
        │     └── Phase 4 / US2 (T017–T027)
        │           ├── Phase 5 / US3 (T028–T032)
        │           │     └── Phase 6 / US4 (T033–T036)
        │           │           └── Phase 7 / US5 (T037–T039)
        │           │                 └── Phase 8 / Polish (T040–T043)
        │           └── Phase 9 / Compliance (T044–T046) [parallel with Phase 5+]
        └── [T005, T006 unblock T015, T021 directly]
```

**US4 (navigation) and US5 (RTL)** can be worked on in parallel once the components from US1–US3 exist, since they only modify existing files.

---

## Parallel Execution Examples

### Within Phase 2 (after T004):
- **Developer A**: T005 (services.ts) + T006 (useWatchlist)
- **Developer B**: T007 (useDashboardKPI) + T008 (useLastViewedTicker) + T009 (motion.ts)

### Within Phase 3 (after Phase 2):
- **Developer A**: T010 (TickerStrip) + T013 (DashboardArimaChart)
- **Developer B**: T011 (DashboardKPICard) + T012 (DashboardZone) + T014 (DashboardPortfolioChart)
- **Developer C**: T015 (ServiceCardGrid)
- Then single-thread: T016 (page.tsx wiring)

### Within Phase 4 (after Phase 3):
- **Developer A**: T017 (useDashboardArima) + T020 (wire ARIMA) + T027 (lastViewedTicker write)
- **Developer B**: T018 (useSectorPerformance) + T022 (DashboardSectorChart)
- **Developer C**: T019 (useDashboardNews) + T023 (DashboardRiskGauge) + T024 (DashboardNewsCard) + T025 (DashboardNewsFeed)
- Then single-thread: T021 (KPI wiring) → T026 (zones 5&6 page wiring)

---

## Implementation Strategy

**MVP Scope**: Complete Phase 1 + Phase 2 + Phase 3 (US1) for a shippable first version.
- Delivers all 6 layout zones with empty-state handling
- All 9 service cards with correct routes
- ARIMA chart (AAPL fallback) + Portfolio placeholder
- KPI cards with zero-state labels
- Satisfies core demo-day requirement (every zone visible and functional)

**Increment 2**: Add Phase 4 (US2) for live data across all zones.

**Increment 3**: Add Phase 5 (US3) + Phase 6 (US4) + Phase 7 (US5) for tier gating, navigation correctness, and RTL polish.

**Increment 4**: Phase 8 (polish) — animations, accessibility, responsive fixes.

**Increment 5**: Phase 9 (compliance & data completeness) — Principle IV/V disclaimers (T044/T045) and portfolio data hook (T046). Can overlap with Phase 5+ once Phase 4 components exist.
