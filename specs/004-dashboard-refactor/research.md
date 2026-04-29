# Research: Dashboard Refactor (Phase 0)

## Unknowns & Clarifications (all resolved)

All major clarifications from the spec have been resolved:
- ARIMA chart ticker is changed by clicking a ticker in the Ticker Strip (Zone 1).
- Sector Performance chart (Zone 5) is degraded for Free users (weekly only; other toggles greyed out with Pro badge).
- User's most recently viewed stock is stored as `lastViewedTicker` in Firestore user doc.
- News feed (Zone 6) is sorted by timestamp descending, showing top 3 (Free) or 6 (Pro) headlines from all watchlist tickers.
- Risk Gauge (Zone 5) shows a greyed-out arc and CTA if no risk profile exists.

## Best Practices & Patterns

- **Dashboard Layout**: 12-column CSS grid, responsive breakpoints, strict zone order (see Principle XI).
- **Chart.js Usage**: All charts use react-chartjs-2, with config per Principle XI (line, doughnut, bar, half-doughnut, radar). No ApexCharts on dashboard.
- **Tier Gating**: All gates enforced server-side (JWT claim); overlays and upgrade prompts for Pro features, never hard blocks.
- **Accessibility**: Keyboard navigation, ARIA labels, WCAG AA contrast, screen-reader text for overlays and badges.
- **RTL/Bilingual**: All text and chart labels must be available in Arabic and English; layout and legends flip for RTL.
- **Navigation**: All cards and CTAs use next/link with locale prefix; no inline service UIs.
- **Skeleton Loading**: All chart/data zones use Tailwind animate-pulse skeletons during fetch; no spinners.
- **Data Fetching**: Use hooks for data (watchlist, ARIMA, sector, risk, news) with error fallback to skeletons.
- **Design Language**: Dark-premium, gold accent, no solid white backgrounds, Framer Motion fadeInUp for entry.

## Decisions

- **Strict adherence to Principle XI**: All dashboard zones, chart types, and card order follow the constitution.
- **No new backend endpoints required**: All data can be sourced from existing endpoints or Firestore; only minor shape adjustments or error handling may be needed.
- **No Constitution violations**: All requirements are achievable within the current stack and timeline.

## Alternatives Considered

- Using ApexCharts for dashboard: **Rejected** (Principle XI mandates Chart.js only).
- Embedding service UIs inline: **Rejected** (dashboard is a navigation hub only).
- Client-only tier gating: **Rejected** (must be enforced server-side).

---

All research tasks for Phase 0 are complete. Proceed to data model and contract design.
