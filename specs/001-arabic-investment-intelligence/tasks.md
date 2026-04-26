# Tasks: sSsahim — Arabic Investment Intelligence

**Input**: Design documents from `specs/001-arabic-investment-intelligence/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅
**Generated**: 2026-04-26
**Team**: Mathematician · Backend · Frontend · AI/Integration

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no outstanding deps)
- **[Story]**: User story label (US1–US7)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffolding — initialise both workspaces so all four team
members can open their directories and start immediately on Day 1.

- [X] T001 Initialise backend Python project: create `backend/pyproject.toml` with FastAPI, uvicorn, httpx, openai, numpy, pandas, scipy, statsmodels, pydantic-settings, cachetools, python-dotenv, pytest, pytest-asyncio dependencies
- [X] T002 Initialise frontend Next.js 14 project in `frontend/` with TypeScript, Tailwind CSS, shadcn/ui, next-intl, Recharts; output `frontend/package.json`, `frontend/next.config.ts`, `frontend/tailwind.config.ts`
- [X] T003 [P] Create root `.gitignore` covering `.env`, `.env.local`, `__pycache__/`, `.next/`, `node_modules/`, `*.pyc`, `.venv/`
- [X] T004 [P] Create `backend/.env.example` documenting all required backend keys (`TWELVE_DATA_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `OPENAI_API_KEY`, `NEWSAPI_KEY`, `MUSAFFA_API_KEY`, `ALLOWED_ORIGINS`)
- [X] T005 [P] Create `frontend/.env.local.example` with `NEXT_PUBLIC_API_URL=http://localhost:8000` as the only frontend env var
- [X] T006 [P] Create all empty placeholder `__init__.py` files to complete backend directory skeleton: `backend/app/`, `backend/app/models/`, `backend/app/services/`, `backend/app/api/`, `backend/tests/`, `backend/tests/unit/`, `backend/tests/integration/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that **must** be complete before any user
story begins. Includes app entry point, config, cache, CORS, error handling,
Twelve Data HTTP client, and the full frontend i18n + type scaffolding.

⚠️ **CRITICAL**: No user story implementation can begin until this phase is complete.

- [X] T007 Create `backend/app/config.py` using `pydantic-settings` `BaseSettings`; expose one typed field per env var from `.env.example`; provide `get_settings()` cached singleton
- [X] T008 Create `backend/app/cache.py`: `TTLCache` from `cachetools` keyed by `(ticker, endpoint)`, TTL = seconds until midnight UTC; expose `get_cached` / `set_cached` helpers
- [X] T009 Create `backend/app/main.py`: FastAPI app, CORS middleware reading `settings.allowed_origins` as comma-separated list, register routers (`/api/stock`, `/api/search`, `/api/sectors`, `/api/allocator`, `/api/health`), global 422 + 500 exception handlers returning JSON `{ "error": "<Arabic message>", "code": "<string>" }`
- [X] T010 [P] Add `GET /api/health` route inline in `backend/app/main.py` returning `{ "status": "ok", "timestamp": "<ISO8601>" }` for Render.com liveness checks
- [X] T011 Implement `backend/app/services/market_data.py`: async `httpx.AsyncClient` wrapper for Twelve Data `/time_series` (1y daily OHLCV), `/quote`, `/technicals` (RSI 14, MACD, EMA20, SMA50), `/fundamentals` (P/E, D/E, revenue growth, interest income ratio, debt/market-cap ratio); Alpha Vantage fallback for quote only; raise typed `DataUnavailableError` on failure
- [X] T012 [P] Configure next-intl locale routing in `frontend/next.config.ts` and `frontend/src/app/[locale]/layout.tsx`; set `defaultLocale="ar"`, `locales=["ar","en"]`; apply `dir="rtl"` for Arabic and `dir="ltr"` for English on the `<html>` element
- [X] T013 [P] Create `frontend/src/messages/ar.json` and `frontend/src/messages/en.json` with top-level key skeletons for all UI sections (`search`, `score`, `risk`, `halal`, `news`, `arima`, `sectors`, `allocator`, `errors`, `common`); populate all Arabic strings now (English strings may be added later)
- [X] T014 [P] Configure Tailwind CSS RTL support in `frontend/tailwind.config.ts`; add `rtl:` variant; import Cairo (Arabic) and Inter (Latin) via `next/font/google` in `frontend/src/app/[locale]/layout.tsx`; set Tailwind `fontFamily` in `frontend/tailwind.config.ts`
- [X] T015 [P] Create `frontend/src/lib/api.ts`: typed `apiFetch<T>(path, options?)` wrapper reading `NEXT_PUBLIC_API_URL`; export named functions `searchStocks`, `getScore`, `getHalal`, `getNews`, `getArima`, `getSectors`, `postAllocator`
- [X] T016 [P] Create `frontend/src/lib/types.ts` with all TypeScript interfaces mirroring data-model.md entities: `Stock`, `InvestmentReadinessScore`, `HalalVerdict`, `NewsCard`, `ARIMAProjection`, `SectorGroup`, `BudgetAllocation`, `AllocationItem`, and the aggregate `StockAnalysis` type

**Checkpoint**: Foundation ready — all four team members can begin their user story tracks in parallel.

---

## Phase 3: User Story 1 — Stock Intelligence Search (P1) 🎯 MVP

**Goal**: Type any ticker or company name → receive a 🟢🟡🔴 Investment Readiness
Score (0–100) with a plain-Arabic two-sentence explanation within 8 seconds.

**Independent Test**: Open the app, type "Saudi Aramco" or "2222.SR", submit — receive
a traffic-light badge with score and Arabic label. No other feature is required.

- [X] T017 Create `backend/app/models/stock.py`: `Stock` model (ticker, name, exchange, current_price, data_freshness_ts, price_history list, fundamental fields) + `InvestmentReadinessScore` model (score 0–100, band, component scores dict, low_confidence bool, data_freshness_label hardcoded `"آخر تحديث: نهاية جلسة أمس"`)
- [X] T018 [P] [US1] Implement `backend/app/services/score_engine.py`: five normalisation formulas (Volatility `max(0,100-(σ/0.60)×100)`, VaR `max(0,100-(VaR/0.05)×100)`, Sharpe `min(100,max(0,(S+1)/3×100))`, Beta `max(0,100-abs(β-1)×50)`, Sentiment `positive→80/neutral→50/negative→20`); weighted sum `0.25V + 0.25VaR + 0.20S + 0.15B + 0.15Sent`; band thresholds 60–100=green, 35–59=yellow, 0–34=red; `low_confidence=True` when `days_of_history < 90` sets numeric metric fields to `null`; **if any weights are adjusted during tuning, update the formula table in research.md AND add a matching comment in `score_engine.py` with rationale before committing (FR-003 requires weights to remain documented)**
- [X] T019 [P] [US1] Extend `backend/app/services/market_data.py` with `search_stocks(query: str) -> list[dict]` calling Twelve Data `/symbol_search`; include `exchange` and `country` in results; limit to 10 results
- [X] T020 [US1] Add `GET /api/search?q={query}` route in `backend/app/api/stock.py` delegating to `market_data.search_stocks`; **validate `q` at route boundary: reject empty or > 100 chars with 422 + Arabic error `"استعلام البحث غير صالح"`**; cache results for 1 hour; return `{ "results": [...] }` (depends on T019)
- [X] T021 [US1] Add `GET /api/stock/{ticker}/score` route in `backend/app/api/stock.py`: **validate `ticker` path parameter matches `^[A-Z0-9.]{1,10}$` at route level before calling any service — return 422 with Arabic error `"رمز السهم غير صالح"` on mismatch (Constitution VII)**; fetch OHLCV from `market_data`, compute score via `score_engine`, cache result; return `InvestmentReadinessScore` JSON; 503 on data failure with Arabic error body (depends on T017, T018, T019)
- [X] T022 [P] [US1] Create home search page `frontend/src/app/[locale]/page.tsx`: Arabic-first search bar with RTL input, "ابحث عن سهم..." placeholder, submit button; display live search suggestions from `searchStocks` API; route to `/stock/[ticker]` on selection
- [X] T023 [P] [US1] Create `frontend/src/components/TrafficLightBadge.tsx`: accept props `score: number`, `band: "green"|"yellow"|"red"`, `lowConfidence?: boolean`; render 🟢🟡🔴 emoji, numeric score, Arabic band label (مناسب / يحتاج بحثاً / تحذير عالٍ); show `"ثقة منخفضة — بيانات محدودة"` badge when `lowConfidence=true`
- [X] T024 [P] [US1] Create `frontend/src/components/DataFreshnessLabel.tsx`: render `"آخر تحديث: نهاية جلسة أمس"` as a small muted label; always visible on score card; accept optional override string prop
- [X] T025 [US1] Create `frontend/src/app/[locale]/stock/[ticker]/page.tsx`: server component fetching `getScore(ticker)`; render `<TrafficLightBadge>` + two-sentence Arabic plain-language summary derived from band + top-component field; **render regulatory compliance label `"تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"` (Constitution Principle V, NON-NEGOTIABLE) directly below `<TrafficLightBadge>` as small but visible text — always rendered, no conditional logic**; render `<DataFreshnessLabel>`; show Arabic spinner during loading (depends on T021, T023, T024)
- [X] T026 [US1] Wire search autocomplete in `frontend/src/app/[locale]/page.tsx` to call `searchStocks(query)` with 300ms debounce; render dropdown list with company name + exchange; navigate on click (depends on T020, T022)
- [X] T027 [US1] Add invalid-ticker error state to `frontend/src/app/[locale]/stock/[ticker]/page.tsx`: when API returns 404 render Arabic message "لم يتم العثور على السهم — يرجى التحقق من الرمز والمحاولة مجدداً" with a back-to-search link (depends on T025)
- [X] T028 [US1] Add 503 graceful degradation in `frontend/src/app/[locale]/stock/[ticker]/page.tsx`: when backend returns 503 or network error, show Arabic retry message without blank screen (depends on T025)

**Checkpoint**: US1 fully functional. Demo: search "2222.SR" → see 🟢/🟡/🔴 score card in Arabic within 8 s.

---

## Phase 4: User Story 2 — Mathematical Risk Panel (P2)

**Goal**: After seeing the score, user expands "تفاصيل المخاطر" to see Volatility,
Beta, VaR, Sharpe, RSI, MACD, P/E — each with an Arabic tooltip.

**Independent Test**: Search any stock, expand risk panel — verify all 7 metrics
appear with Arabic labels and tooltips before news agent is built.

- [X] T029 [P] [US2] Extend `backend/app/services/market_data.py`: add `get_technicals(ticker)` fetching RSI(14), MACD line + signal, EMA20, SMA50, and `get_fundamentals(ticker)` fetching P/E, D/E ratio from Twelve Data; return `null` per field on partial failure
- [X] T030 [P] [US2] Extend `backend/app/models/stock.py` `InvestmentReadinessScore`: add optional fields `rsi`, `macd_value`, `macd_signal`, `ema20`, `sma50`, `pe_ratio`, `debt_equity`, **`revenue_growth`** (FR-004); annotate all as `Optional[float] = None` so low-confidence stocks omit them
- [X] T031 [US2] Update `backend/app/services/score_engine.py` to accept RSI, MACD, and fundamental inputs from `market_data`; populate the new model fields from T030 (including `revenue_growth`); **the score formula (0.25V + 0.25VaR + 0.20S + 0.15B + 0.15Sent) MUST remain unchanged per FR-003 — RSI, MACD, D/E, P/E, and revenue_growth are display-only fields and do NOT affect the formula**; apply null-safe guards to all new display fields (depends on T029, T030)
- [X] T032 [P] [US2] Create `frontend/src/components/RiskPanel.tsx`: collapsible panel triggered by "تفاصيل المخاطر" button; render rows for σ Volatility, Beta, VaR, Sharpe (component scores), RSI, MACD, P/E, D/E, **نمو الإيرادات (`revenue_growth`)** (FR-004) — each with numeric value, Arabic label, and `?` tooltip icon using shadcn/ui `Tooltip`
- [X] T033 [P] [US2] Add Arabic tooltip explanation strings for **all 8 metrics** to `frontend/src/messages/ar.json` under `risk.tooltips.*` (Volatility, Beta, VaR, Sharpe, RSI, MACD, P/E, نمو الإيرادات); each string must be one sentence a school student understands; include MENA benchmark note for Beta
- [X] T034 [US2] Integrate `<RiskPanel>` into `frontend/src/app/[locale]/stock/[ticker]/page.tsx`; pass score object props; handle null values by displaying "غير متاح" with tooltip explaining why (depends on T031, T032, T033)
- [X] T035 [US2] Display MENA benchmark label in `<RiskPanel>` next to Beta: derive from ticker suffix (`.SR`→TASI, `.CA`→EGX30, `.AE`→ADX, default→S&P 500) in `frontend/src/components/RiskPanel.tsx`
- [X] T036 [US2] Confirm `"غير متاح"` tooltip explanation string is in `frontend/src/messages/ar.json` for each metric when `low_confidence=true`; verify `<RiskPanel>` renders it correctly for a stock with < 90 days history

**Checkpoint**: US2 complete. Risk panel visible and independently testable.

---

## Phase 5: User Story 3 — Halal Screening Panel (P3)

**Goal**: Stock results page shows 🟢 حلال / 🟡 يحتاج تطهير / 🔴 غير حلال verdict
with underlying ratios and the non-removable disclaimer.

**Independent Test**: Search a conventional bank stock (e.g. Saudi commercial bank)
→ see 🔴 Non-Halal with stated interest ratios. Disclaimer always visible.

- [X] T037 [P] [US3] Create `HalalVerdict` Pydantic model in `backend/app/models/stock.py`: fields `verdict` (enum Halal/PurificationRequired/NonHalal), `source` (enum musaffa/builtin), `debt_ratio: float`, `interest_ratio: float`, `purification_pct: Optional[float]`, `disclaimer: str = "التحقق النهائي من الحلية يقع على عاتق المستخدم"` (field has `const=True` — immutable)
- [X] T038 [P] [US3] Implement `backend/app/services/halal_screener.py`: (a) try Musaffa API `/compliance/{ticker}` with 5 s timeout; (b) on failure/rate-limit fall back to AAOIFI built-in: **apply business activity pre-filter first (FR-005a) — if `stock.sector` matches a prohibited set (conventional banking, alcohol, gambling, tobacco, weapons) → NonHalal regardless of ratios**; then ratio check: `debt/market_cap < 0.33` AND `interest_income/revenue < 0.05` → Halal; `0.33–0.50` debt OR `0.05–0.10` interest → PurificationRequired; above → NonHalal; always set `source` field correctly; compute `purification_pct` for PurificationRequired
- [X] T039 [US3] Add `GET /api/stock/{ticker}/halal` route in `backend/app/api/stock.py`: call `halal_screener`, cache result 24 h, return `HalalVerdict` JSON; on complete failure return 503 with Arabic error (depends on T037, T038)
- [X] T040 [P] [US3] Create `frontend/src/components/HalalPanel.tsx`: show verdict badge (🟢/🟡/🔴 + Arabic label), `debt_ratio` and `interest_ratio` as formatted percentages, `purification_pct` row when applicable, source label ("مصدر: Musaffa" or "مصدر: قواعد AAOIFI الداخلية"), disclaimer string **always rendered** in visible non-muted text — no hide/dismiss control
- [X] T041 [US3] Add all Halal strings to `frontend/src/messages/ar.json` under `halal.*`: verdict labels (حلال / يحتاج تطهير / غير حلال), ratio labels, purification explanation sentence, disclaimer (verbatim `"التحقق النهائي من الحلية يقع على عاتق المستخدم"`)
- [X] T042 [US3] Integrate `<HalalPanel>` into `frontend/src/app/[locale]/stock/[ticker]/page.tsx`; fetch via `getHalal(ticker)`; handle 503 with Arabic fallback inline (depends on T039, T040, T041)
- [X] T043 [US3] Add `"حساب التطهير"` (Purification calculation) expandable row in `<HalalPanel>`: show only when `verdict=PurificationRequired`; display `purification_pct`% of dividends/gains to donate with one-sentence Arabic explanation in `frontend/src/components/HalalPanel.tsx`
- [X] T044 [US3] Add graceful degradation for Halal API: when both Musaffa and built-in are unavailable (missing fundamental data), `halal_screener.py` raises `DataUnavailableError`; API route returns 503; `<HalalPanel>` shows Arabic message "تعذّر تحميل حكم الحلية — سيُعرض عند توفر البيانات"

**Checkpoint**: US3 complete. Demo: search bank stock → 🔴 verdict + ratios + disclaimer. Fully independently testable.

---

## Phase 6: User Story 4 — Arabic News Intelligence Agent (P4)

**Goal**: Structured 4-field Arabic news card (ماذا حدث / لماذا يهم / من يتأثر /
المدى الزمني) with sentiment badge; score reflects sentiment; fallback message
shown when news unavailable.

**Independent Test**: Trigger news for Saudi Aramco → 4 Arabic fields render;
score adjusts; fallback message appears when news API disabled.

- [X] T045 [P] [US4] Create `NewsCard` Pydantic model in `backend/app/models/news.py`: fields `ticker`, `pub_date`, `headline`, `what_happened`, `why_it_matters`, `who_is_affected`, `time_horizon` (enum short/long), `sentiment` (enum positive/neutral/negative), `fallback_mode: bool = False`
- [X] T046 [P] [US4] Implement NewsAPI fetch in `backend/app/services/news_agent.py`: `async fetch_articles(ticker, company_name) -> list[dict]`; query NewsAPI `/everything` for latest 5 articles matching ticker or company name; fall back to GDELT DOC 2.0 API on NewsAPI failure; return empty list on both failures
- [X] T047 [US4] Implement OpenAI structured summarisation in `backend/app/services/news_agent.py`: `async summarise(articles) -> NewsCard`; use `gpt-4o-mini` with `response_format={"type":"json_object"}`; prompt requests JSON with keys `what_happened`, `why_it_matters`, `who_is_affected`, `time_horizon`, `sentiment`; enforce 10 s hard timeout via `asyncio.wait_for`; on timeout/error return `NewsCard(fallback_mode=True)` with all text fields null (depends on T046)
- [X] T048 [US4] Add `GET /api/stock/{ticker}/news` route in `backend/app/api/stock.py`: call `news_agent`, cache 1 h; if `fallback_mode=True` still return 200 with `fallback_mode=true` flag (not 503); main analysis page must handle this gracefully (depends on T045, T047)
- [X] T049 [P] [US4] Create `frontend/src/components/NewsCard.tsx`: render four labelled Arabic rows (ماذا حدث / لماذا يهم / من يتأثر / المدى: قصير/طويل), sentiment badge (إيجابي/محايد/سلبي with colour); when `fallbackMode=true` show fallback message instead of card fields
- [X] T050 [US4] Add fallback Arabic strings to `frontend/src/messages/ar.json` under `news.fallback`: `"تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات الرياضية فقط"` (verbatim); also add all four field label strings under `news.fields.*`
- [X] T051 [US4] Integrate `<NewsCard>` into `frontend/src/app/[locale]/stock/[ticker]/page.tsx`; fetch via `getNews(ticker)`; show fallback message when `fallbackMode=true`; news section must not block score display — use `React.Suspense` or parallel fetch (depends on T048, T049, T050)
- [X] T052 [US4] Connect sentiment to score in `backend/app/api/stock.py`: when news endpoint already cached, pass `sentiment` to `score_engine.compute_score()`; if news unavailable pass `"neutral"` as default so score still renders without news

**Checkpoint**: US4 complete. All P1–P4 stories delivered. Team has a full demo-able vertical slice.

---

## Phase 7: User Story 5 — ARIMA 30-Day Price Projection (P5)

**Goal**: Line chart showing 90-day history + 30-day projection + 95% CI bands,
with non-removable disclaimer. Hidden for stocks with < 1 year history.

**Independent Test**: Generate projection for stock with ≥ 1 year history → chart
renders with CI bands and disclaimer. For IPO stock → Arabic insufficient-data message.

- [X] T053 [P] [US5] Create `ARIMAProjection` Pydantic model in `backend/app/models/arima.py`: fields `ticker`, `history_dates: list[str]`, `history_prices: list[float]`, `forecast_dates: list[str]` (30 items), `forecast_prices: list[float]`, `lower_ci: list[float]`, `upper_ci: list[float]`, `model_order: tuple[int,int,int]`, `generated_at: str`, `disclaimer: str = "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"` (immutable), `insufficient_data: bool = False`
- [X] T054 [P] [US5] Implement `backend/app/services/arima_service.py`: check `len(prices) >= 252` else return `ARIMAProjection(insufficient_data=True)`; log-difference prices; grid search `p∈{0,1,2}`, `d∈{0,1}`, `q∈{0,1,2}` selecting by AIC; fit best `statsmodels ARIMA`; generate 30-step forecast + `get_forecast(30).conf_int(alpha=0.05)`; back-transform via cumulative sum + exp; clamp lower CI to 0; return projection
- [X] T055 [US5] Add `GET /api/stock/{ticker}/arima` route in `backend/app/api/stock.py`: fetch 1y OHLCV from `market_data`, call `arima_service`; cache 24 h; if `insufficient_data=True` return 200 with `insufficient_data: true` and empty forecast arrays (not 404) (depends on T053, T054)
- [X] T056 [P] [US5] Create `frontend/src/components/ARIMAChart.tsx`: Recharts `ComposedChart`; plot last 90 days of history as solid line; plot 30-day forecast as dashed line; `Area` component for upper/lower CI shaded band; `ReferenceLine` at today; hide chart entirely if `insufficientData=true`
- [X] T057 [US5] Render ARIMA disclaimer **always visible directly below chart** in `frontend/src/components/ARIMAChart.tsx`: hardcoded `"هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"` — no conditional rendering, no dismiss button
- [X] T058 [US5] Add insufficient-data Arabic message to `frontend/src/messages/ar.json` under `arima.insufficient`: `"البيانات التاريخية غير كافية لإنشاء توقع إحصائي موثوق لهذا السهم"`; render this string in place of chart when `insufficientData=true` in `frontend/src/components/ARIMAChart.tsx`
- [X] T059 [US5] Integrate `<ARIMAChart>` into `frontend/src/app/[locale]/stock/[ticker]/page.tsx`; fetch via `getArima(ticker)`; load in parallel with other panels via `Promise.all` (depends on T055, T056, T057, T058)
- [X] T060 [US5] Verify CI lower bound clamping works end-to-end in `backend/app/services/arima_service.py`: add assert `all(v >= 0 for v in lower_ci)` at end of function before returning; write manual test with a low-price stock to confirm no negatives leak through

**Checkpoint**: US5 complete. All Must + Should stories (P1–P5) delivered. ✅ Hackathon eligibility secured.

---

## Phase 8: User Story 6 — Sector Explorer (P6 — Could)

**Purpose**: Implement only if P1–P5 are fully stable before end of Day 4.

**Goal**: Browse sectors (قطاعات مستقرة / قطاعات نمو عالي / قطاعات حلال) without
needing to know a specific ticker.

**Independent Test**: Navigate to `/sectors` without searching a stock; verify ≥3
sector groups with Arabic labels and ≥2 example stocks each.

- [X] T061 [P] [US6] Create `SectorGroup` Pydantic model in `backend/app/models/sector.py`: fields `category` (enum stable/high_growth/halal_friendly), `category_label_ar: str`, `category_label_en: str`, `explanation_ar: str`, `sectors: list[str]`, `example_tickers: list[str]`
- [X] T062 [P] [US6] Implement `GET /api/sectors` route in `backend/app/api/sectors.py`: return hardcoded list of ~8 sector groups (MENA-focused: banking, energy, telecom, healthcare, food, real estate, tech, utilities) with Arabic category labels and one-sentence Arabic explanations; for each example ticker fetch cached TrafficLightBadge score
- [X] T063 [P] [US6] Create Sector Explorer page `frontend/src/app/[locale]/sectors/page.tsx`: fetch `getSectors()`, render three category sections; on sector click show example stocks list; add navigation link from home page
- [X] T064 [P] [US6] Create `frontend/src/components/SectorCard.tsx`: accept `SectorGroup` prop; display category badge (Arabic label + colour), sector names list, example tickers with `<TrafficLightBadge>` inline
- [X] T065 [US6] Wire Sector Explorer to `/api/sectors` in `frontend/src/app/[locale]/sectors/page.tsx`; clicking an example ticker navigates to `/stock/[ticker]` (depends on T062, T063, T064)
- [X] T066 [US6] Add all sector Arabic strings (category labels, explanations, sector names) to `frontend/src/messages/ar.json` under `sectors.*`; ensure no English finance terms appear in Arabic copy

**Checkpoint**: US6 complete.

---

## Phase 9: User Story 7 — Budget Allocator (P7 — Could)

**Purpose**: Implement only if P1–P5 are stable AND time remains before Demo Day.

**Goal**: Enter budget + risk tolerance + horizon + Halal preference → receive
3–5 recommended stocks with exact share counts and allocation percentages.

**Independent Test**: POST allocator with $5,000 / Medium / Halal=Yes → table of
3–5 🟢 Halal stocks with share quantities and amounts.

- [X] T067 [P] [US7] Create `BudgetAllocation` and `AllocationItem` Pydantic models in `backend/app/models/sector.py`: `AllocationItem` has `ticker`, `weight_pct`, `amount`, `shares`, `score`, `verdict`; `BudgetAllocation` has `budget`, `items: list[AllocationItem]`, `disclaimer: str = "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"` (immutable)
- [X] T068 [P] [US7] Implement allocator logic in `backend/app/api/allocator.py`: load candidate tickers (hardcoded MENA universe of ~20 stocks); filter by Halal verdict when `exclude_haram=True`; score-rank survivors; **exclude stocks where `price > (budget / min_stocks)` before ranking — these would yield 0 shares per slot; include an Arabic note `"حجم المبلغ غير كافٍ للاستثمار في هذا السهم"` per excluded stock in the response's `excluded` list (L3 guard)**; pick top 3–5 by `InvestmentReadinessScore`; compute weight proportional to score; calculate `shares = floor(amount / price)` and actual `amount = shares × price`
- [X] T069 [US7] Implement `POST /api/allocator` route in `backend/app/api/allocator.py`: accept `{ budget, risk_level, horizon, halal_only }` JSON body; call allocator logic; return `BudgetAllocation`; 400 on invalid input with Arabic error message (depends on T067, T068)
- [X] T070 [P] [US7] Create Budget Allocator page `frontend/src/app/[locale]/allocator/page.tsx`: form with four Arabic-labelled fields (المبلغ، مستوى المخاطرة selector، أفق الاستثمار selector، حلال فقط checkbox); submit calls `postAllocator`; add navigation from home
- [X] T071 [US7] Display allocation results table in `frontend/src/app/[locale]/allocator/page.tsx`: columns ticker · company · allocation% · amount · shares · `<TrafficLightBadge>`; show disclaimer below table (depends on T069, T070)
- [X] T072 [US7] Ensure allocator disclaimer `"تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"` is always rendered visibly below the results table in `frontend/src/app/[locale]/allocator/page.tsx` — no conditional, no dismiss

**Checkpoint**: US7 complete.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Performance, rate limiting, parallel endpoint bundle, deployment
configs, responsive QA, and Demo Day dry-run.

- [X] T073 Implement full `GET /api/stock/{ticker}` bundle endpoint in `backend/app/api/stock.py`: run `score_engine`, `halal_screener`, `news_agent`, and OHLCV fetch concurrently via `asyncio.gather(*tasks, return_exceptions=True)`; assemble partial response per Constitution VI (math score always returned even if 1–2 services fail); return single JSON blob so frontend only needs one HTTP call
- [X] T074 [P] Add rate limiting middleware to `backend/app/main.py` using in-memory sliding window counter: 20 req/min per IP for `/api/stock/*/score`, 10 req/min for `/api/stock/*/arima`, 60 req/min default; return 429 with Arabic message "لقد تجاوزت الحد المسموح به — يُرجى الانتظار قليلاً"
- [X] T075 [P] Create `netlify.toml` at repository root: `[build] base="frontend" command="npm run build" publish=".next"`; `[[plugins]] package="@netlify/plugin-nextjs"`; set `NEXT_PUBLIC_API_URL` environment variable via Netlify UI (document in quickstart.md)
- [X] T076 [P] Create `render.yaml` at repository root: define `backend` web service, `runtime: python`, `buildCommand: pip install -e .`, `startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT`, `envVars` references; ensure `ALLOWED_ORIGINS` includes Netlify production URL
- [X] T077 [P] RTL responsive QA pass: verify all seven pages render correctly at 360px (mobile) and 1280px (desktop) in both `ar` and `en` locales; fix any LTR text leakage in `frontend/src/` components; ensure `<html dir>` switches correctly via next-intl
- [X] T078 [P] Final Arabic copy review: grep for any English finance terms in `frontend/src/messages/ar.json` body strings (jargon like "VaR", "MACD" are acceptable as ticker/acronym labels but must have Arabic tooltips); confirm all four Arabic verbatim strings are present and unmodified:
  - `"التحقق النهائي من الحلية يقع على عاتق المستخدم"` in HalalPanel
  - `"هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"` below ARIMAChart
  - `"تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"` below allocator results and score card
  - `"ثقة منخفضة — بيانات محدودة"` on low-confidence score cards
  - `"تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات الرياضية فقط"` in NewsCard fallback
- [X] T079 Demo Day integration dry-run: execute all five mandatory SC-005 scenarios end-to-end (Single Stock "2222.SR", Budget Allocator $5,000/Medium/Halal, Sector Explorer browse, deliberate news-API-off graceful degradation, ARIMA chart render) and confirm no errors or blank screens; record any issues for last-minute fixes
- [X] T080 [P] Update `ALLOWED_ORIGINS` in `backend/app/config.py` default to include the Netlify production URL `https://<app>.netlify.app` once deployed; verify CORS pre-flight returns correct headers for both `http://localhost:3000` and the Netlify origin
- [X] T081 [P] Load test `GET /api/stock/{ticker}/score` (SC-002 + constitution performance target): run `hey -n 500 -c 100` or `locust` against local dev server simulating 100 concurrent users with 10 s ramp-up; assert p95 response time ≤ 5 s and < 1% error rate; document results in `backend/tests/integration/load_test_notes.md`; re-run against Render.com staging before Demo Day

---

## Dependency Graph

Story completion order (sequential dependencies):

```
Phase 1 (T001–T006)
    └─► Phase 2 (T007–T016)
            ├─► Phase 3 US1 (T017–T028)   ← MVP vertical slice
            │       ├─► Phase 4 US2 (T029–T036)
            │       ├─► Phase 5 US3 (T037–T044)   ← can start parallel to US2
            │       ├─► Phase 6 US4 (T045–T052)   ← can start parallel to US2/US3
            │       └─► Phase 7 US5 (T053–T060)   ← can start parallel to US4
            ├─► Phase 8 US6 (T061–T066)   ← only after US1–US5 stable
            └─► Phase 9 US7 (T067–T072)   ← only after US1–US5 stable
Phase 10 Polish (T073–T080) — after US1–US5, before Demo Day
```

**Within US1**: T017 → T018, T019 (parallel) → T020, T021 → T022, T023, T024 (parallel) → T025, T026 → T027, T028

**Within US4**: T045, T046 (parallel) → T047 → T048 → T049, T050 (parallel) → T051 → T052

---

## Parallel Execution Examples per Story

**Day 1 (Apr 27) — Foundation + US1 launch**
```
Mathematician:   T001 → T007 → T008 → T018 (score_engine)
Backend:         T002 → T009 → T010 → T011 (market_data) → T019 → T020 → T021
Frontend:        T003 → T006 → T012 → T013 → T014 → T015 → T016 → T022 → T023 → T024
AI/Integration:  T004 → T005 → (assist T015/T016)
```

**Day 2 (Apr 28) — US1 wire-up + US2 + US3 parallel**
```
Mathematician:   T031 (extend score_engine for US2)
Backend:         T025 → T026 → T027 → T028 (US1 complete) → T029, T037 (parallel)
Frontend:        T032, T033 (parallel) → T034 → T035 → T036 (US2) | T040, T041 → T042 → T043 (US3)
AI/Integration:  T038 (halal_screener AAOIFI fallback) → T039 (US3 backend)
```

**Day 3 (Apr 29) — US4 + US5 parallel**
```
Mathematician:   T054 (arima_service) → T055 → T060
Backend:         T046 → T047 → T048 (news_agent pipeline)
Frontend:        T049 → T050 → T051 (NewsCard) | T056 → T057 → T058 → T059 (ARIMAChart)
AI/Integration:  T045 (NewsCard model) → T052 (sentiment→score)
```

**Day 4 (Apr 30) — US6/US7 (if time) + Polish**
```
All members:     T061–T072 (Could features) if P1–P5 stable
                 T073 → T074 → T075 → T076 → T077 → T078 → T079 → T080
```

---

## Implementation Strategy

**MVP scope (Day 1 target)**: Phase 1 + Phase 2 + Phase 3 (US1) = T001–T028.
A working search-to-score flow in Arabic is the minimum viable demo.

**Incremental delivery**:
1. T001–T028 → US1 alone is demo-able (score card in Arabic)
2. + T029–T036 → Risk panel added (score becomes explainable)
3. + T037–T044 → Halal panel added (Sharia-compliance live)
4. + T045–T052 → News agent added (full Track 3 compliance)
5. + T053–T060 → ARIMA chart added (visual impact for Demo Day)
6. + T073–T080 → Polish, rate limits, deployment ← **minimum for submission**
7. + T061–T072 → Sector Explorer + Budget Allocator ← only if time allows

**Constitution gates enforced**:
- Principle I (Demo-Day First): P6/P7 phases gated behind P1–P5 completion
- Principle III (Arabic-First): All message keys in `ar.json` created before their UI tasks
- Principle IV (Halal Integrity): `HalalVerdict.disclaimer` is a `const` field; `<HalalPanel>` has no dismiss control
- Principle V (Regulatory Compliance): ARIMA and allocator disclaimers are hardcoded strings, not i18n keys
- Principle VI (Graceful Degradation): Every external service call has a typed fallback path
- Principle VII (Security): API keys only via `config.py`/`BaseSettings`; no hardcoded credentials

---

## Summary

| Phase | Stories | Tasks | Notes |
|-------|---------|-------|-------|
| 1 — Setup | — | T001–T006 (6) | Both workspaces ready |
| 2 — Foundation | — | T007–T016 (10) | Blocking prerequisite |
| 3 — US1 | P1 Must | T017–T028 (12) | 🎯 MVP vertical slice |
| 4 — US2 | P2 Must | T029–T036 (8) | Risk panel |
| 5 — US3 | P3 Must | T037–T044 (8) | Halal screening |
| 6 — US4 | P4 Should | T045–T052 (8) | News agent |
| 7 — US5 | P5 Should | T053–T060 (8) | ARIMA chart |
| 8 — US6 | P6 Could | T061–T066 (6) | Sector Explorer |
| 9 — US7 | P7 Could | T067–T072 (6) | Budget Allocator |
| 10 — Polish | — | T073–T080 (8) | Deploy + Demo Day |
| **Total** | **7 stories** | **80 tasks** | |

**Parallel opportunities**: 42 of 80 tasks carry `[P]` — approximately 50% of the
backlog can be worked concurrently across the four-member team.

**Suggested MVP scope**: Complete Phase 1 + Phase 2 + Phase 3 (T001–T028) on Day 1.
This delivers a fully functional end-to-end search-to-score flow and satisfies
SC-001, SC-002 (partial), and FR-001–FR-003 independently.
