# Research: sSsahim — Arabic Investment Intelligence

**Phase 0 output** | **Date**: 2026-04-26 | **Branch**: `001-arabic-investment-intelligence`

All decisions listed here resolve NEEDS CLARIFICATION items from the Technical
Context and inform the Phase 1 design artifacts.

---

## 1. Financial Data API — Primary Provider

**Decision**: Twelve Data as primary; Alpha Vantage as fallback.

**Rationale**:
- Twelve Data free tier: 800 API credits/day, 8 req/min. Covers OHLCV timeseries,
  real-time quote, technical indicators (RSI, MACD, EMA/SMA), fundamentals (P/E,
  D/E, revenue growth). Strong MENA coverage: Saudi (Tadawul), UAE (ADX/DFM),
  Egypt (EGX), US (NYSE/NASDAQ).
- Alpha Vantage free tier: 25 requests/day (far too low for demo; requires $50/mo
  premium for 75 req/min). Usable only as a fallback if Twelve Data hits quota.
- Both APIs return JSON with consistent OHLCV format compatible with pandas DataFrames.

**Alternatives considered**:
- Yahoo Finance (`yfinance`): No official API; terms of service prohibit automated
  scraping in commercial contexts. High risk of getting blocked during demo.
- Financial Modeling Prep (FMP): Good fundamentals coverage, but free tier is
  250 req/day and lacks Arabic company names.

**Implementation notes**:
- Obtain Twelve Data key by Apr 27 EOD.
- Cache OHLCV responses (TTL = midnight) to avoid quota exhaustion during demo.
- Endpoint used: `GET /time_series` (1y daily), `GET /quote`, `GET /technicals`
  (RSI, MACD, EMA20, SMA50), `GET /fundamentals` (P/E, D/E, revenue growth).

---

## 2. MENA Index Benchmarks for Beta Calculation

**Decision**: Use Twelve Data to fetch index time series for benchmark Beta.

**Rationale**:
- Twelve Data covers Tadawul All Share Index (TASI, `^TASI`), EGX 30 (`^EGX30`),
  and ADX General Index. These are retrievable with the same `/time_series` endpoint.
- Beta assignment logic: KSA tickers (suffix `.SR`) → TASI; Egypt tickers (`.CA`) →
  EGX 30; UAE tickers (`.AE`) → ADX; all others → S&P 500 (`^GSPC`).
- Beta is computed as: $\beta = \frac{\text{Cov}(r_s, r_m)}{\text{Var}(r_m)}$ using
  252 trading-day rolling daily returns via NumPy/pandas.

**Alternatives considered**:
- Hardcoding S&P 500 for all stocks: Rejected — spec explicitly requires local MENA
  index; using S&P for MENA stocks would misrepresent relative risk (TASI has
  different volatility profile to US markets).

---

## 3. Halal Screening — Musaffa API vs. Built-in Fallback

**Decision**: Attempt Musaffa API registration before Apr 27 EOD. Ship with
AAOIFI-inspired built-in fallback from Day 1 so demo never depends solely on Musaffa.

**Rationale**:
- Musaffa API provides AAOIFI-certified screening for 20,000+ global stocks.
  Endpoint: `GET /api/v1/stock/screening?symbol={ticker}`. Returns verdict +
  underlying ratios. Free tier exists (100 req/day) — sufficient for demo.
- If Musaffa onboarding takes >24h, the built-in fallback is fully spec-compliant
  and covers the demo script stocks.

**Built-in fallback rules** (AAOIFI-inspired):
1. **Business activity**: If company sector is in `{Banks, Insurance,
   Alcohol & Tobacco, Gambling, Weapons}` → 🔴 Non-Halal immediately.
2. **Debt screen**: `total_debt / market_cap > 0.33` → 🔴 Non-Halal.
3. **Interest screen**: `interest_income / total_revenue > 0.05` → 🔴 Non-Halal.
4. **Purification screen**: `interest_income / total_revenue > 0.00 AND ≤ 0.05`
   → 🟡 Purification Required. Purification % = `interest_income / total_revenue`.
5. Otherwise → 🟢 Halal.

**Fundamentals source for fallback**: FMP `/api/v3/income-statement` and
`/api/v3/balance-sheet` (FMP has 250 req/day free tier). Alternatively, Twelve
Data fundamentals endpoint if FMP is unavailable.

---

## 4. Arabic News Intelligence — NewsAPI + OpenAI

**Decision**: NewsAPI as primary news source; GDELT DOC 2.0 as secondary for
Arabic/MENA coverage. OpenAI `gpt-4o-mini` with structured output (JSON mode)
for Arabic summarisation.

**Rationale**:
- NewsAPI free tier: 100 req/day, English-language sources. Query:
  `GET /v2/everything?q={company_name}&language=en&pageSize=5&sortBy=publishedAt`.
  Covers financial outlets (Reuters, Bloomberg, FT) with good MENA coverage.
- GDELT DOC 2.0: Free, no API key. Returns Arabic + English articles from
  global news. Used when NewsAPI returns <2 results for a MENA ticker.
- OpenAI `gpt-4o-mini`: ~$0.00015/1K input tokens. A typical 3-article news
  summarisation prompt is ~800 tokens → ~$0.00012 per call. Cost-negligible
  for hackathon usage.
- Structured output prompt forces JSON schema:
  ```json
  {"what_happened": "...", "why_it_matters": "...", "who_is_affected": "...",
   "time_horizon": "short|long", "sentiment": "positive|neutral|negative"}
  ```
  All field values must be in Arabic per the system prompt instruction.

**Timeout handling**: 10-second hard timeout on OpenAI call. On timeout/error,
news panel shows Arabic fallback message; math-only score still renders.

---

## 5. ARIMA Implementation

**Decision**: `statsmodels.tsa.arima.model.ARIMA` with auto-order selection
via AIC minimisation over a constrained search space.

**Rationale**:
- `pmdarima.auto_arima` (wraps statsmodels) is the most convenient option but
  adds a dependency. For a 4-day build, manual grid search over
  `p ∈ {0,1,2}, d ∈ {0,1}, q ∈ {0,1,2}` (18 combinations) is fast enough
  on 252 data points (~0.3s on a single CPU core) and avoids the extra package.
- All models are fit on log-differenced prices to ensure stationarity. Raw price
  projections are recovered via `exp(cumsum(predicted_log_diffs))`.
- Confidence intervals: `get_forecast(steps=30).conf_int(alpha=0.05)` gives
  95% CI bands.
- Minimum data requirement: 252 trading days (≈1 year). Stocks with <252 days
  show the Arabic insufficient-data message.

**Performance**: Fitting ARIMA on 252 points takes ~0.3–0.8s. Run async
alongside the news agent call to parallelise backend processing.

---

## 6. Next.js 14 — RTL + Bilingual Setup

**Decision**: `next-intl` for i18n routing and string management. Tailwind CSS
`dir="rtl"` attribute on `<html>` for Arabic locale; `dir="ltr"` for English.

**Rationale**:
- `next-intl` v3 has native App Router support (Next.js 14). Provides typed
  message keys, locale-aware routing (`/ar/...`, `/en/...`), and server
  component compatibility.
- Tailwind CSS v3.3+ includes RTL variants (`rtl:` prefix) and the
  `@tailwindcss/typography` plugin handles RTL prose correctly.
- shadcn/ui components use CSS logical properties (`start`/`end`) and are
  RTL-compatible without modifications.
- Arabic default: the `[locale]` segment defaults to `ar`. If the user's
  browser locale is detected as Arabic, they land on `/ar/`. English is
  available at `/en/`.

**Font**: Cairo (Arabic) + Inter (Latin) via `next/font/google`. Cairo is
the standard Arabic web font recommended for UI due to its modern design
and good number rendering.

---

## 7. Deployment Strategy

**Decision**: Netlify (frontend) + Render.com free tier (backend FastAPI container).

**Rationale**:
- Netlify: Full Next.js App Router support via `@netlify/plugin-nextjs`, free tier
  supports unlimited bandwidth for demo, automatic HTTPS, preview URLs per branch.
  No cold start (CDN-hosted). `next-intl` RSC and i18n routing work without modification.
- Render.com: Free tier runs a Docker container (512MB RAM, shared CPU), auto-
  deploys from GitHub. Cold-start is ~30s but can be avoided by pinging the
  service before the demo. Suitable for ~100 concurrent demo users within the
  free tier request limit.
- Alternative considered — Railway.app: $5 credit free, slightly better cold
  start, but requires credit card. Render.com is fully free.

**Environment variables**: All API keys injected via Netlify environment
variables (frontend: `NEXT_PUBLIC_API_URL` only) and Render secret env vars
(backend: all keys). `.env.example` files document required keys with
placeholder values only.

---

## 8. Score Engine — Normalisation Approach

**Decision**: Min-max normalise each component metric to 0–100 sub-score,
then apply weights. Higher normalised score = lower risk (inverted where
needed).

**Component normalisation rules**:

| Component | Raw metric | Direction | Normalisation |
|-----------|-----------|-----------|---------------|
| Volatility | Annualised σ (daily returns × √252) | High σ = bad | `max(0, 100 - (σ / 0.60) × 100)` — σ ≥ 60% maps to 0 |
| VaR | 95% 1-day VaR (as positive %) | High VaR = bad | `max(0, 100 - (VaR / 0.05) × 100)` — VaR ≥ 5% maps to 0 |
| Sharpe | Annualised Sharpe ratio | High Sharpe = good | `min(100, max(0, (Sharpe + 1) / 3 × 100))` — clamp to 0–100 |
| Beta | β vs. local index | >1 = more volatile than market = worse | `max(0, 100 - abs(beta - 1) × 50)` |
| Sentiment | Compound score from OpenAI {positive/neutral/negative} | positive = good | positive→80, neutral→50, negative→20; no news→50 (neutral) |

**Final score**: $S = 0.25 \cdot V_{norm} + 0.25 \cdot VaR_{norm} + 0.20 \cdot Sharpe_{norm} + 0.15 \cdot \beta_{norm} + 0.15 \cdot Sent_{norm}$

**Low-confidence flag**: When `days_of_history < 90`, Volatility, VaR, Sharpe,
and Beta sub-scores are all set to 50 (neutral) and the score carries the
"ثقة منخفضة — بيانات محدودة" badge. Only fundamentals-based components (if
any) and sentiment contribute meaningfully.

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|------------|
| Primary financial data API | Twelve Data (primary), Alpha Vantage (fallback) |
| MENA index for Beta | Twelve Data index series; ticker-suffix routing logic |
| Halal screening source | Musaffa API + AAOIFI built-in fallback (ship both from Day 1) |
| News source | NewsAPI (primary), GDELT DOC 2.0 (secondary for Arabic/MENA) |
| LLM for news summarisation | OpenAI gpt-4o-mini, structured JSON output, Arabic system prompt |
| ARIMA implementation | statsmodels manual grid search; log-differenced prices |
| Frontend i18n/RTL | next-intl v3 + Tailwind RTL variants; Cairo + Inter fonts |
| Deployment | Netlify (frontend) + Render.com free container (backend) |
| Score normalisation | Per-component min-max with inverted direction where needed |
