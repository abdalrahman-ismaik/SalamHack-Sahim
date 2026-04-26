# Implementation Plan: sSsahim — Arabic Investment Intelligence

**Branch**: `001-arabic-investment-intelligence` | **Date**: 2026-04-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-arabic-investment-intelligence/spec.md`

## Summary

Build a bilingual (Arabic-first RTL) web application that lets Arab beginner
investors search any stock and immediately receive a traffic-light Investment
Readiness Score (0–100) backed by a weighted math engine (Volatility 25% /
VaR 25% / Sharpe 20% / Beta 15% / News Sentiment 15%), a Halal screening
verdict with exact financial ratios, a structured Arabic news summary (4
fields), and an ARIMA 30-day price projection chart. The system must be
fully operational for a 5-minute live demo on May 1 2026.

**Team composition**: 4 members — Mathematician, Backend Developer, Frontend
Developer, AI/Integration Engineer. Delivery window: 4 working days (Apr 27–30).

## Technical Context

**Language/Version**: Python 3.11 (backend) · TypeScript / Next.js 14 (frontend)
**Primary Dependencies**:
- Backend: FastAPI, uvicorn, NumPy, pandas, scipy.stats, statsmodels, openai, httpx, python-dotenv
- Frontend: Next.js 14, Tailwind CSS, shadcn/ui, Recharts (charts), next-intl or next-i18next (i18n/RTL)

**Storage**: No persistent user storage for MVP. Backend uses in-memory LRU
cache (Python `functools.lru_cache` or `cachetools`) for EOD data responses
(TTL: midnight rollover). No database required.

**Testing**: pytest + pytest-asyncio (backend) · Jest + React Testing Library (frontend)

**Target Platform**: Linux container / serverless (backend) · Netlify (frontend)

**Project Type**: Full-stack web application (REST API backend + Next.js frontend)

**Performance Goals**: Full stock analysis page (score + metrics + Halal verdict)
≤ 8 seconds wall-clock from search submission. Backend aims for p95 ≤ 5s for
the compute-heavy path (math engine + ARIMA + news agent in parallel).

**Constraints**:
- Alpha Vantage free tier: 25 requests/day (standard) — use Twelve Data as
  primary (800 req/day free) or upgrade if needed before Apr 27
- OpenAI API: structured output mode required for consistent Arabic JSON
- Stateless requests — no session or user identity
- API keys via environment variables only (never hardcoded)
- EOD data only for MVP; real-time (FR-015) is post-MVP

**Scale/Scope**: 4 team members · ~7 screens/pages · 15 API endpoints · demo
audience ~100 concurrent users during the May 1 judging window

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate Question | Status |
|-----------|---------------|--------|
| I. Demo-Day First | Are P1–P3 (FR-001–FR-007) built before any Should/Could feature? | ✅ PASS — plan phases strictly enforce P1 → P2 → P3 ordering |
| II. MVP Vertical Slices | Is each slice end-to-end (UI → API → data) before the next begins? | ✅ PASS — each day targets one complete slice |
| III. Arabic-First | Is Arabic the primary language for all user-facing output? | ✅ PASS — FR-007 is Must; all acceptance scenarios require Arabic first |
| IV. Halal Integrity | Does every Halal verdict include the non-removable disclaimer? | ✅ PASS — FR-006 is unconditional; encoded in entity and contract |
| V. Regulatory Compliance | Are all scores/projections labelled as independent informational analysis, not licensed investment advice? | ✅ PASS — FR-011 + spec Assumptions enforce labels |
| VI. Graceful Degradation | Is a math-only fallback defined for every external API failure? | ✅ PASS — FR-012 + 5 edge cases in spec |
| VII. Security | Are API keys via env vars? No user data stored? Inputs validated? | ✅ PASS — stated in Assumptions + constitution enforced in contracts |

**Gate result**: All 7 principles PASS. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-arabic-investment-intelligence/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── stock-api.md
│   └── allocator-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Settings via pydantic-settings (env vars)
│   ├── models/
│   │   ├── stock.py             # Stock, InvestmentReadinessScore, HalalVerdict
│   │   ├── news.py              # NewsCard
│   │   ├── arima.py             # ARIMAProjection
│   │   └── sector.py            # SectorGroup, BudgetAllocation
│   ├── services/
│   │   ├── market_data.py       # Twelve Data / Alpha Vantage adapter
│   │   ├── score_engine.py      # Weighted formula (Volatility/VaR/Sharpe/Beta/Sentiment)
│   │   ├── halal_screener.py    # Musaffa API + AAOIFI fallback
│   │   ├── news_agent.py        # NewsAPI fetch + OpenAI structured summary
│   │   └── arima_service.py     # statsmodels ARIMA fit + projection
│   ├── api/
│   │   ├── stock.py             # /api/stock/* routes
│   │   ├── sectors.py           # /api/sectors route
│   │   └── allocator.py         # /api/allocator route
│   └── cache.py                 # In-memory TTL cache (EOD data)
├── tests/
│   ├── unit/
│   │   ├── test_score_engine.py
│   │   ├── test_halal_screener.py
│   │   └── test_arima_service.py
│   └── integration/
│       └── test_stock_api.py
├── pyproject.toml
└── .env.example                 # Documents required env vars (no real values)

frontend/
├── src/
│   ├── app/
│   │   ├── [locale]/            # next-intl locale routing (ar / en)
│   │   │   ├── page.tsx         # Home / search landing page
│   │   │   ├── stock/[ticker]/
│   │   │   │   └── page.tsx     # Stock analysis page
│   │   │   ├── sectors/
│   │   │   │   └── page.tsx     # Sector Explorer (P6)
│   │   │   └── allocator/
│   │   │       └── page.tsx     # Budget Allocator (P7)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── TrafficLightBadge.tsx
│   │   ├── RiskPanel.tsx
│   │   ├── HalalPanel.tsx
│   │   ├── NewsCard.tsx
│   │   ├── ARIMAChart.tsx
│   │   ├── SectorCard.tsx
│   │   └── DataFreshnessLabel.tsx
│   ├── lib/
│   │   ├── api.ts               # Typed fetch wrappers for backend
│   │   └── utils.ts
│   ├── messages/
│   │   ├── ar.json              # Arabic strings (primary)
│   │   └── en.json              # English strings (secondary)
│   └── styles/
│       └── globals.css          # Tailwind base + RTL config
├── tests/
│   └── components/
├── next.config.ts
├── tailwind.config.ts
└── .env.local.example           # NEXT_PUBLIC_API_URL only

.env.example                     # Root-level documentation of all required keys
.gitignore                       # Ensures .env files are never committed
```

**Structure Decision**: Web application (Option 2 variant). Backend and
frontend are separate directories at the repository root. No monorepo tool
required — backend runs independently on a container host; frontend deploys
to Netlify. The split allows Mathematician and Backend to work in `backend/`
independently of Frontend and AI/Integration working in `frontend/` and
`backend/app/services/`.

## Complexity Tracking

> No constitution violations. No entries required.
