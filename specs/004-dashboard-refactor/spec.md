# Feature Specification: Premium Dashboard Refactor

**Feature Branch**: `004-dashboard-refactor`  
**Created**: 2026-04-29  
**Status**: Draft  
**Input**: User description: "Refactor the dashboard page to be premium, attractive, and easy to navigate. Focus on Sahim's services and features with appropriate charts, visuals, and cards. Services redirect to their dedicated pages from the dashboard."

---

## Clarifications

### Session 2026-04-29

- Q: Can the user change the ARIMA chart ticker from the dashboard, and if so, how? → A: Clicking a ticker symbol in Zone 1 (Ticker Strip) dynamically updates the Zone 3 ARIMA chart to display that ticker's forecast. No inline form or dropdown on the chart card itself.
- Q: Is Zone 5 (Sector Performance) gated for Free users? → A: Degraded for Free — weekly data only; month and 3-month time-frame toggle options are rendered but greyed out with a "برو" badge. The Risk Gauge (right side of Zone 5) is fully visible to all tiers.
- Q: Where is the user's "most recently viewed stock" persisted for the Zone 3 ARIMA default? → A: Stored as `lastViewedTicker` field on the Firestore user document (`users/{uid}`), written client-side on each stock page visit. No backend change required.
- Q: Which watchlist tickers drive the Zone 6 news feed, and in what order? → A: Fetch the latest news for all watchlist tickers; sort all results by timestamp descending; display the top 3 (Free) or top 6 (Pro) regardless of which ticker they belong to.
- Q: What is displayed in the Zone 5 Risk Gauge when the user has no Risk Wizard score? → A: Render a greyed-out semi-circular arc at 0% with an overlay text "اكتشف مستوى مخاطرتك" and a CTA button linking to the Risk Wizard page. No blank space or default score.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First-Time Post-Login Overview (Priority: P1)

A newly authenticated user arrives at the dashboard for the first time. They need an immediate at-a-glance understanding of what Sahim offers and what their current financial standing looks like — without needing to navigate anywhere first.

**Why this priority**: This is the entry point for every session. If the first impression is poor or confusing, users drop off before discovering Sahim's value. This scenario is the dashboard's core reason for existence.

**Independent Test**: Can be fully tested by signing in with a free-tier account that has no prior activity, landing on `/[locale]/dashboard`, and verifying that all 6 layout zones render with appropriate empty-state fallbacks.

**Acceptance Scenarios**:

1. **Given** a newly signed-in user with an empty watchlist and no risk profile, **When** the dashboard loads, **Then** Zone 1 (Ticker Strip) displays live scrolling prices, Zone 2 (KPI Cards) shows zero-state values with Arabic labels ("لا توجد أسهم بعد", "احسب الآن"), Zone 3 (Primary Charts) shows ARIMA fallback ticker (AAPL, 7-day for Free) with an upgrade prompt and a placeholder text for the portfolio donut, Zones 4–6 render with content or graceful empty states.
2. **Given** a user who has not set a risk profile, **When** the Risk Level KPI card is displayed, **Then** it shows "لم يُحدَّد بعد" and a CTA link to the Risk Wizard.
3. **Given** a user who has never calculated Zakat, **When** the Zakat Reminder KPI card is displayed, **Then** it shows a gold "احسب الآن" CTA linking to the Zakat Calculator page.

---

### User Story 2 — Returning User Daily Market Check (Priority: P1)

A returning Pro user visits the dashboard to quickly scan the market status for their watchlist before deciding what action to take.

**Why this priority**: Daily active use is the product's primary engagement loop. The dashboard must surface actionable intelligence in under 10 seconds — without clicking anywhere.

**Independent Test**: Can be tested with a Pro account that has a watchlist of at least 3 tickers and a saved risk profile, verifying that all 6 zones display real data without additional navigation.

**Acceptance Scenarios**:

1. **Given** a Pro user with 5 watchlist tickers, **When** the dashboard loads, **Then** Zone 2 KPI cards display the correct watchlist count, halal compliance rate (e.g., "80% حلال"), risk level label, and days since last Zakat calculation.
2. **Given** a Pro user whose most recently viewed stock is TSLA, **When** Zone 3 loads, **Then** the ARIMA line chart defaults to TSLA with 30-day horizon and confidence interval bands visible.
3. **Given** a Pro user, **When** Zone 5 loads, **Then** the Sector Performance bar chart shows horizontal bars for each sector with weekly % change, and a time-frame toggle is accessible.
4. **Given** a Pro user's watchlist contains tickers with recent news, **When** Zone 6 loads, **Then** 6 news headline cards are displayed; each shows the ticker symbol, inline Halal badge, Arabic headline (2-line truncation), source, relative timestamp, and "اقرأ المزيد" link.

---

### User Story 3 — Free User Discovering Pro Features (Priority: P2)

A free-tier user sees the full dashboard layout but encounters soft upgrade prompts for Pro-gated features, motivating them to upgrade without feeling blocked or confused.

**Why this priority**: Free-to-Pro conversion is the primary revenue driver. The dashboard must make the value of Pro visible without alienating free users.

**Independent Test**: Can be tested with a free-tier account by verifying that locked Pro service cards show a soft overlay ("ترقِّ للوصول"), the ARIMA chart shows 7-day data with an upgrade banner, and all Free-accessible services (Stock Screener, Halal Verdict, Risk Wizard, Zakat Calculator) work without restriction.

**Acceptance Scenarios**:

1. **Given** a Free user, **When** Zone 4 (Service Cards Grid) renders, **Then** Free services (Stock Screener, Halal Verdict, Risk Wizard, Zakat Calculator) are fully clickable with no overlay, while Pro services (ARIMA Forecast, Portfolio Allocator, Risk Dashboard, Sector Explorer) show a semi-transparent "ترقِّ للوصول" overlay and upgrade button.
2. **Given** a Free user, **When** Zone 3 (ARIMA chart) renders, **Then** the chart displays 7 days of data with a bottom banner "وسِّع الأفق إلى 30 يوماً — ترقَّ إلى برو" linking to the pricing page.
3. **Given** a Free user, **When** Zone 6 (News Feed) renders, **Then** exactly 3 news headlines are shown (not 6), with no error message — just a note "اشترك في برو لرؤية المزيد".
4. **Given** a Free user who clicks an upgrade CTA on any locked card, **When** the click is registered, **Then** the user is navigated to `/{locale}/pricing` without an interstitial modal blocking them.

---

### User Story 4 — Navigation to Service Pages (Priority: P2)

Any authenticated user clicks on a service card or chart CTA and is taken directly to the corresponding service page, pre-filled with context where possible.

**Why this priority**: The dashboard is a navigation hub; its only output action is routing users to services. If navigation is broken or unclear, the dashboard fails its core purpose.

**Independent Test**: Can be tested by clicking each service card and verifying the correct route, locale prefix, and any pre-filled parameters.

**Acceptance Scenarios**:

1. **Given** any user, **When** they click the "Stock Screener" service card, **Then** they are navigated to `/{locale}/stock` with the correct locale.
2. **Given** any user, **When** they click the Zakat Reminder KPI "احسب الآن" CTA, **Then** they are navigated to `/{locale}/tools/zakat` (optionally pre-filling portfolio value from KPI data via URL search params).
3. **Given** any user, **When** they click "اقرأ المزيد" on a news headline card in Zone 6, **Then** they are navigated to `/{locale}/stock/{ticker}` (the stock detail page for that ticker).
4. **Given** any user, **When** they click a ticker in the Ticker Strip (Zone 1), **Then** they are navigated to `/{locale}/stock/{symbol}`.

---

### User Story 5 — Arabic RTL Dashboard Experience (Priority: P2)

An Arabic-speaking user accesses the dashboard with the `ar` locale. All text, chart labels, layout direction, and navigation are fully right-to-left.

**Why this priority**: Arabic is the primary target language. Any RTL failure is a first-class defect per Constitution Principle III.

**Independent Test**: Can be tested by switching locale to `ar` and verifying visual alignment, chart label direction, and that no English text appears without translation.

**Acceptance Scenarios**:

1. **Given** the `ar` locale is active, **When** the dashboard loads, **Then** all KPI card labels, service card titles and descriptions, chart axis labels, and news headlines are in Arabic with RTL text direction.
2. **Given** the `ar` locale, **When** a Chart.js chart renders, **Then** legends and axis labels render right-to-left, and the 7+5 column split in Zones 3 and 5 is visually mirrored (right-heavy column becomes left-heavy in RTL).
3. **Given** the `ar` locale, **When** the Service Cards Grid renders, **Then** cards flow right-to-left while maintaining the defined priority order (Stock Screener first at top-right, Zakat Calculator last at bottom-left in RTL).

---

### Edge Cases

- What happens when the backend is unavailable during chart data fetch? Zone 3 and Zone 5 must show skeleton placeholders (`animate-pulse`) — not error toasts — and retry silently.
- What happens when a user's watchlist is empty? Zone 2 halal compliance rate shows "—" and Zone 6 shows "أضف أسهماً لمتابعة أخبارها" empty-state placeholder.
- What happens when news is available for some watchlist tickers but not others? Zone 6 shows only the headlines that exist, sorted by recency, up to the tier limit (3 or 6). If fewer headlines exist than the limit, no placeholder fills the remaining slots.
- What happens when the user has no saved risk profile? Zone 2 Risk Level card links to the Risk Wizard with an "اكتشف مستوى مخاطرتك" CTA. Zone 5 Risk Gauge renders a greyed-out arc at 0% with the same CTA linking to `/{locale}/tools/risk-wizard`.
- What happens on a 360px mobile screen? All zones collapse to single column. Service cards in Zone 4 stack vertically. Charts maintain minimum height of 200px.
- What happens when the ticker data fails to load for the Ticker Strip? The strip shows the last cached data or hides gracefully with no layout shift.
- What happens when a user clicks a ticker in Zone 1 and the ARIMA data for that ticker is unavailable? Zone 3 shows the skeleton placeholder and retries silently; the selected ticker name remains as the chart title to confirm the selection was registered.
- What happens when a user accesses the dashboard without authentication? They are immediately redirected to `/{locale}/auth/signin?returnTo=/{locale}/dashboard`.

---

## Tier & Accessibility Constraints *(SaaS — mandatory)*

- **Tier gate**:
  - **Free**: Full dashboard visible; ARIMA chart shows 7-day horizon only (upgrade prompt inline); Service cards for Pro features show soft overlay ("ترقِّ للوصول"); News Feed shows 3 headlines only; Sector Performance chart shows weekly data only (month/3-month toggle greyed out with "برو" badge); Risk Gauge always fully visible.
  - **Pro**: Full 30-day ARIMA chart; all service cards fully clickable; News Feed shows 6 headlines; full sector performance time-frame toggle (week/month/3 months); Risk Gauge fully visible.
  - **Enterprise**: Inherits all Pro access; no additional dashboard-specific gates in this feature.
  - Tier is read from the server-side JWT claim — never from client-side state alone.
- **Accessibility**: All interactive elements (service cards, KPI card CTAs, chart toggle buttons, news links) MUST support keyboard navigation via Tab, Enter, and Space. Chart containers MUST have `aria-label` describing the data shown. Tier overlay badges MUST be announced by screen readers ("متاح للمشتركين في برو فقط"). WCAG 2.1 AA contrast compliance required for all text on dark backgrounds.
- **Bilingual**: All user-visible text (KPI labels, service card titles and descriptions, chart axis labels, empty-state messages, CTA text, tier badges) MUST have Arabic and English translations registered in `frontend/src/messages/ar.json` and `en.json`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard page MUST display 6 layout zones in the defined priority order: Ticker Strip → KPI Cards → Primary Charts → Service Cards Grid → Secondary Insights → News Feed.
- **FR-002**: Zone 1 (Ticker Strip) MUST be always visible to all authenticated users and display live-scrolling stock prices with an inline Halal status badge per ticker.
- **FR-003**: Zone 2 MUST display exactly 4 KPI cards: Watchlist Size, Halal Compliance Rate, Risk Level, and Zakat Reminder — each with a primary value, subtitle, icon, and optional delta/CTA.
- **FR-004**: Zone 3 MUST render an ARIMA price trend line chart (defaulting to the user's most recently viewed stock or AAPL) with confidence interval shading. Free users see 7 days; Pro users see 30 days. Clicking any ticker symbol in Zone 1 (Ticker Strip) MUST dynamically update the Zone 3 chart to display that ticker's ARIMA forecast without page navigation. The chart card MUST display the currently selected ticker symbol as its title.
- **FR-005**: Zone 3 MUST also render a Portfolio Allocation doughnut chart. If no portfolio data exists, a text placeholder "أضف أسهمك لرؤية التوزيع" MUST be displayed instead of an empty chart.
- **FR-006**: Zone 4 MUST display all 9 Sahim service cards in the defined priority order. Each card MUST include: icon, Arabic title, one-line Arabic description, tier badge, and a CTA link/button.
- **FR-007**: Locked Pro service cards in Zone 4 MUST show a semi-transparent "ترقِّ للوصول" overlay with an upgrade CTA. They MUST NOT be hidden or removed — the full card must be visible beneath the overlay.
- **FR-008**: Zone 5 MUST render a Sector Performance horizontal bar chart with a time-frame toggle (Week / Month / 3 Months). The chart MUST use abbreviated Arabic sector names on the Y-axis. Free users MUST see the weekly view by default; the "شهر" and "3 أشهر" toggle options MUST be rendered but visually disabled (greyed out) with a "برو" badge — clicking them MUST navigate to `/{locale}/pricing`.
- **FR-009**: Zone 5 MUST also render a Risk Score gauge using a semi-circular chart. The gauge MUST display three colored zones: green (low risk), amber (moderate), red (high risk) corresponding to the user's composite risk score. If the user has no saved risk score (Risk Wizard not yet completed), the gauge MUST render a greyed-out arc at 0% with an overlay text "اكتشف مستوى مخاطرتك" and a CTA button linking to `/{locale}/tools/risk-wizard`. The gauge is fully visible to all tiers with no tier gate.
- **FR-010**: Zone 6 MUST fetch the latest news for all of the user's watchlist tickers, sort results by timestamp descending, and display the top 3 cards for Free users or top 6 cards for Pro users. Each card MUST show: ticker symbol, inline Halal badge, Arabic headline (2-line max), source, relative timestamp, and a "اقرأ المزيد" link.
- **FR-011**: All chart containers MUST show `animate-pulse` skeleton placeholders during data fetching. No spinner icons. No error toasts for transient failures.
- **FR-012**: Every service card, news card, and KPI CTA MUST navigate to the correct service page via `next/link` with the active locale prefix.
- **FR-013**: The dashboard page MUST be fully functional and visually correct at 360px (mobile), 768px (tablet), 1280px, and 1440px (desktop) viewport widths.
- **FR-014**: In the `ar` locale, all chart legends and axis labels MUST render right-to-left. The 7+5 grid splits in Zones 3 and 5 MUST visually mirror for RTL layout.
- **FR-015**: Service card entry animations MUST use a `fadeInUp` stagger pattern with approximately 0.05 seconds delay between each card. The full page-load entry for each zone MUST use a similar `fadeInUp` stagger of 0.1 seconds between zones.
- **FR-016**: All KPI card data (watchlist count, halal rate, risk level, last Zakat date) MUST be fetched from existing backend endpoints or Firestore data. No hardcoded sample data in production.
- **FR-017**: The dashboard MUST NOT embed any service feature UI inline. It is a navigation hub only. All service interactions happen on dedicated service pages.

### Key Entities

- **KPI Summary**: Aggregated metrics derived from the user's Firestore profile and watchlist — watchlist item count, halal compliance ratio, risk profile label, last Zakat calculation timestamp, and `lastViewedTicker` (most recently viewed stock symbol, used as the default ticker for Zone 3 ARIMA chart).
- **ARIMA Chart Data**: 30-day price prediction series with upper/lower confidence bounds for a given ticker symbol. Sourced from the existing ARIMA backend endpoint.
- **Portfolio Allocation**: Breakdown of user's tracked stocks by sector or asset type. Sourced from the user's watchlist metadata.
- **Sector Performance**: Weekly/monthly/quarterly % return per market sector. Sourced from the existing sector backend endpoint.
- **Risk Score**: Composite numeric score 0–100 derived from the user's Risk Wizard results. Sourced from Firestore user profile.
- **News Headline**: AI-generated news summary for a watched ticker, including Arabic headline, source URL, and relative timestamp. Sourced from the existing news agent backend endpoint.
- **Service Card**: A navigational unit representing one Sahim feature. Attributes: service ID, Arabic title, Arabic description, icon reference, tier requirement, target route.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify their Halal compliance rate and Risk Level within 5 seconds of the dashboard loading, without scrolling.
- **SC-002**: All 9 service cards are visible without scrolling on a 1280px viewport (above the fold for the grid section), and each card navigates to the correct page in under 1 second.
- **SC-003**: The dashboard loads and renders all 6 zones (including live chart data) in under 3 seconds on a standard broadband connection.
- **SC-004**: Skeleton loading placeholders appear within 100ms for all chart zones, preventing layout shift during data fetching.
- **SC-005**: Free users encounter at least 2 visible Pro upgrade prompts on the dashboard without experiencing any broken or empty UI sections.
- **SC-006**: Arabic RTL layout renders without any text overflow, chart clipping, or misaligned elements at 360px, 768px, and 1280px.
- **SC-007**: 95% of navigation clicks from service cards successfully route to the correct service page with the correct locale prefix.
- **SC-008**: All interactive elements on the dashboard are reachable via keyboard-only navigation with visible focus indicators.
- **SC-009**: The dashboard page passes WCAG 2.1 AA contrast requirements for all text elements against the dark background.
- **SC-010**: Daily active users who land on the dashboard complete at least one navigation action (click to a service page) within a single session — target: 70% of sessions.

---

## Assumptions

- The existing backend endpoints for ARIMA forecasting, sector performance, and news agent are operational and will return data in the expected format. No backend changes are required for this feature.
- The user's watchlist data and risk profile are stored in Firestore and accessible via existing hooks (`useWatchlist`, `useUserProfile` or equivalent). If these hooks do not exist, they will be created as part of this feature's implementation.
- The user's most recently viewed ticker (`lastViewedTicker`) is stored as a field in the Firestore user document (`users/{uid}`). The stock detail page writes this field client-side on each visit. The dashboard reads it to default the Zone 3 ARIMA chart. No backend endpoint change is required.
- Portfolio allocation data is derived from the user's watchlist (stocks they track), not from brokerage account integration. Users track stocks manually — there is no live portfolio sync.
- The `react-chartjs-2` (Chart.js v4) library is already installed in the frontend project. No new charting library will be added.
- Framer Motion is already installed and used in the project. The `fadeInUp` animation variant already exists or will be created as a shared utility.
- The existing `TickerStrip`, `ServiceCardGrid`, `DashboardAlertsBanner`, and `TierBadge` components will be retained and integrated into the new layout — not replaced from scratch.
- The `ServiceCardGrid` component will be updated to accept a fixed service order (9 cards) rather than the existing dynamic `SERVICES` array order.
- All existing i18n translation keys in `ar.json` and `en.json` will be preserved. New keys will be added under a `dashboard` namespace.
- Mobile (360px) is supported but not the primary design target for this feature. Desktop (1280px) is the primary viewport.
- The Zakat Reminder KPI card pre-fills the portfolio value via URL search params only if that data is readily available in Firestore — this is a best-effort enhancement, not a hard requirement.
