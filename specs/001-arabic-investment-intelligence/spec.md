# Feature Specification: sSsahim — Arabic Investment Intelligence for Beginners

**Feature Branch**: `001-arabic-investment-intelligence`
**Created**: 2026-04-26
**Status**: Draft
**Track**: SalamHack 2026 — Track 3: Understanding & Managing Money (فهم المال وإدارته)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Stock Intelligence Search (Priority: P1)

An Arab beginner investor searches for a stock by name or ticker symbol and
immediately receives a single, colour-coded traffic-light score (🟢 Suitable /
🟡 Research More / 🔴 High Caution) along with a plain-Arabic explanation of
what the score means, why it was assigned, and whether the stock is
Sharia-compliant.

**Why this priority**: This is the core value proposition. Every other feature
is only useful once a user can look up a stock and get a comprehensible,
trustworthy verdict. Without this, the product has no entry point.

**Independent Test**: Open the app, type "Saudi Aramco" or "2222.SR", and
receive a traffic-light score with an Arabic explanation within 8 seconds.
The score must be non-zero and the explanation must be readable by someone
with zero finance background. Delivers standalone value.

**Acceptance Scenarios**:

1. **Given** a user on the search page, **When** they type a valid ticker or
   company name and submit, **Then** the system displays a 🟢🟡🔴 badge with a
   0–100 Investment Readiness Score and a two-sentence Arabic plain-language
   summary within 8 seconds.

2. **Given** a user receives a 🔴 score, **When** they read the explanation,
   **Then** the explanation states at least one specific reason in Arabic (e.g.,
   high volatility, negative news, debt ratio concern) without using untranslated
   finance jargon.

3. **Given** a user types an invalid or unrecognised ticker, **When** they
   submit, **Then** the system displays a friendly Arabic error message and
   suggests trying a different search term — no crash or blank screen.

---

### User Story 2 — Mathematical Risk Panel (Priority: P2)

After viewing the traffic-light score, the user can expand a Risk Details panel
that shows quantitative risk metrics (Volatility, Beta, VaR, Sharpe Ratio, RSI,
MACD, P/E) alongside a beginner-friendly Arabic tooltip explaining what each
number means in plain language.

**Why this priority**: The traffic-light score builds trust only if users can
see the evidence behind it. This transforms sSsahim from a black box into an
This transforms sSsahim from a black box into an
analytical intelligence tool, directly supporting Track 3's "Understanding Money" goal.

**Independent Test**: Search for any valid stock, expand the Risk panel, and
verify that at least Volatility, Beta, VaR, and Sharpe Ratio are shown with
Arabic labels and tooltip explanations. This can be delivered and demoed
before the news agent is built.

**Acceptance Scenarios**:

1. **Given** a stock results page, **When** the user clicks "تفاصيل المخاطر"
   (Risk Details), **Then** the panel shows Volatility (σ), Beta, 95% VaR, and
   Sharpe Ratio — each with a numeric value and an Arabic tooltip (e.g., "بيتا
   = 0.8 تعني أن السهم أهدأ من السوق بشكل عام").

2. **Given** the risk panel is open, **When** the user clicks the tooltip icon
   next to "VaR", **Then** a modal or popover explains VaR in a single Arabic
   sentence a school student could understand — no English financial acronyms
   left unexplained.

3. **Given** a stock with a MENA listing, **When** the Beta is calculated,
   **Then** it is calculated against the relevant local index (Tadawul All Share
   for KSA stocks, EGX 30 for Egyptian stocks) not the S&P 500.

---

### User Story 3 — Halal Screening Panel (Priority: P3)

Alongside the risk score, the user sees a Halal compliance verdict (🟢 Halal /
🟡 Purification Required / 🔴 Non-Halal) with the underlying financial ratios
and a disclaimer that the final Halal determination is the user's personal
responsibility.

**Why this priority**: A significant portion of the target audience — Arab
Muslim investors — will not invest without a Halal verdict. This is a
competitive differentiator that no Western platform offers with this level of
transparency.

**Independent Test**: Search for a conventional bank stock (e.g., a Saudi
commercial bank) and verify the system returns 🔴 Non-Halal with a stated
reason (interest-based business model) and the exact debt/interest ratios.
Can be demoed independently of the news agent.

**Acceptance Scenarios**:

1. **Given** a stock search result, **When** the Halal panel loads, **Then** it
   shows one of three verdicts (🟢 حلال / 🟡 يحتاج تطهير / 🔴 غير حلال) with
   the specific Debt/Market-Cap ratio and Interest Income/Revenue ratio that
   produced the verdict.

2. **Given** a stock requiring purification (🟡), **When** the user clicks
   "حساب التطهير" (Calculate Purification), **Then** the system shows the
   percentage of dividends or gains that should be donated to charity, along
   with a brief Arabic explanation of why.

3. **Given** any Halal screening result, **Then** the disclaimer
   "التحقق النهائي من الحلية يقع على عاتق المستخدم" is always visible adjacent
   to the verdict — it cannot be hidden or dismissed.

---

### User Story 4 — Arabic News Intelligence Agent (Priority: P4)

For any searched stock, the user sees a structured Arabic news summary that
explains: what happened, why it matters, who is affected, and whether the
impact is short-term or long-term — rather than a raw headline or English
article link.

**Why this priority**: This is the most differentiating feature for Arab
beginners, but it depends on the LLM integration and news API being stable,
making it slightly riskier to build than the math engine. It unlocks full
Track 3 compliance by turning financial news into financial literacy.

**Independent Test**: Trigger a news summary for a stock that has recent news
(e.g., Saudi Aramco, Apple), verify four structured Arabic fields render
correctly: ماذا حدث / لماذا يهم / من يتأثر / المدى الزمني.

**Acceptance Scenarios**:

1. **Given** a stock with available recent news, **When** the news agent runs,
   **Then** the UI renders a structured card with four labelled Arabic fields:
   "ماذا حدث" / "لماذا يهم" / "من يتأثر" / "المدى: قصير / طويل".

2. **Given** a news sentiment is negative, **When** the card renders, **Then**
   a sentiment badge (سلبي / محايد / إيجابي) appears and the overall traffic-
   light score reflects any negative sentiment shift.

3. **Given** the news API is unavailable or times out, **When** the system
   falls back, **Then** the traffic-light score still renders using math-only
   data, and the news section shows a friendly Arabic message:
   "تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات
   الرياضية فقط."

---

### User Story 5 — ARIMA 30-Day Price Projection (Priority: P5)

The user can view a 30-day price projection chart (built with a statistical
ARIMA model) with confidence interval bands and an explicit disclaimer that
the chart is an independent statistical projection, not a guarantee or licensed
investment advice.

**Why this priority**: Adds strong demo visual impact and demonstrates the
mathematician's contribution. Lower priority than core risk/Halal because it
requires historical data of sufficient length and the ARIMA fitting is
time-sensitive to implement correctly.

**Independent Test**: Generate a 30-day projection for any stock with ≥1 year
of daily price history. The chart must show a trend line and upper/lower
confidence bands. The disclaimer must be present.

**Acceptance Scenarios**:

1. **Given** a stock with at least 1 year of daily price history, **When** the
   ARIMA section loads, **Then** a line chart shows the historical 90-day price
   plus a 30-day forward projection with upper and lower 95% confidence bands.

2. **Given** the ARIMA chart is displayed, **Then** the disclaimer
   "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة" is always visible directly
   below the chart — it cannot be hidden.

3. **Given** insufficient historical data (< 1 year), **When** projection is
   requested, **Then** the system hides the chart and shows an Arabic message:
   "البيانات التاريخية غير كافية لإنشاء توقع إحصائي موثوق لهذا السهم."

---

### User Story 6 — Sector Explorer (Priority: P6)

Users who do not know which stock to search can browse a Sector Explorer that
categorises sectors as Stable / High-Growth High-Risk / Halal-Friendly this
week, with a one-sentence Arabic explanation for each category.

**Why this priority**: Serves complete beginners who have no starting point.
Lower priority than stock-specific features; implement only if Days 1–4
deliver P1–P5 successfully.

**Independent Test**: Navigate to the Sector Explorer without searching a
stock. Verify at least three sector categories render with Arabic labels and
descriptions. Can be built as a mostly static page for the MVP.

**Acceptance Scenarios**:

1. **Given** a user on the Sector Explorer page, **When** the page loads,
   **Then** at least three sector groups are displayed (قطاعات مستقرة /
   قطاعات نمو عالي / قطاعات حلال) each with 2–4 named sectors and a one-
   sentence Arabic explanation.

2. **Given** a user clicks on a sector, **When** the sector detail loads,
   **Then** a list of example stocks in that sector is shown, each with their
   traffic-light badge.

---

### User Story 7 — Budget Allocator (Priority: P7)

A user inputs their available budget, risk tolerance (Low / Medium / High),
investment time horizon, and Halal preference, and receives a personalised
allocation of 3–5 stocks with exact share counts and percentage allocations.

**Why this priority**: Highly compelling demo feature but depends on P1–P3
being stable. Implement only if time remains after Day 4.

**Independent Test**: Enter $5,000 / Medium risk / Halal = Yes. Receive a
table of 3–5 stocks with share counts, allocation %, and traffic-light badges.

**Acceptance Scenarios**:

1. **Given** a user fills the allocator form with budget, risk level, horizon,
   and Halal preference, **When** they submit, **Then** the system returns 3–5
   stocks matching the filters with exact share quantities, dollar amounts, and
   🟢🟡🔴 ratings.

2. **Given** Halal = Yes, **Then** all recommended stocks show 🟢 Halal
   verdict — no 🟡 or 🔴 Halal stocks appear in the recommendation.

---

### Edge Cases

- What happens when a stock ticker is valid but the financial data provider
  returns incomplete data (missing VaR, no P/E)?
  → Display available metrics; replace missing metrics with "غير متاح" (N/A)
  and reduce the traffic-light score confidence accordingly.

- What happens when the OpenAI API call times out or returns an error?
  → Fall back to math-only score with visible Arabic warning; do not block
  the page render.

- What happens when a user enters a non-MENA stock (e.g., NVIDIA)?
  → Calculate Beta against S&P 500; label the benchmark explicitly. All other
  features work the same.

- What happens when the Musaffa Halal API is unavailable?
  → Fall back to the AAOIFI-inspired built-in rules engine using fundamental
  ratios from the financial data API. Show "مصدر: قواعد AAOIFI الداخلية" label.

- What happens when a stock has fewer than 90 days of price history (e.g.,
  a recent IPO)?
  → Display the traffic-light score and all computable metrics (P/E, debt
  ratios) but attach a visible "ثقة منخفضة — بيانات محدودة" badge to the score card.
  Metrics that require ≥90 data points (Volatility, Beta, VaR, Sharpe) are
  shown as "غير متاح" with a tooltip explaining why.

---

## Requirements *(mandatory)*

### Functional Requirements

**Core (Must — P1–P3, required for hackathon eligibility):**

- **FR-001**: Users must be able to search any stock by ticker symbol or
  company name and receive results covering US, KSA (Tadawul), UAE (ADX/DFM),
  and Egyptian (EGX) markets. All price data and computed scores are based on
  end-of-day (EOD) data refreshed daily; a data-freshness label (e.g., "آخر
  تحديث: نهاية جلسة أمس") must be displayed on every score card.
- **FR-002**: The system must compute and display a 0–100 Investment Readiness
  Score rendered as a 🟢🟡🔴 traffic-light badge using fixed thresholds:
  60–100 = 🟢 Suitable, 35–59 = 🟡 Research More, 0–34 = 🔴 High Caution.
- **FR-003**: The score must be derived from a weighted formula combining:
  Volatility σ (25%), 95% Value at Risk (25%), Sharpe Ratio (20%),
  Beta vs. local index (15%), and News Sentiment (15%). Weights are fixed
  for the MVP; they may be tuned during implementation but must remain
  documented and consistent across all score computations.
- **FR-004**: The system must display RSI, MACD, moving averages, P/E ratio,
  debt-to-equity ratio, and revenue growth for each searched stock.
- **FR-005**: The system must evaluate Sharia compliance using: (a) business
  activity classification (no alcohol, gambling, conventional banking),
  (b) Debt/Market Cap < 33%, (c) Interest Income/Revenue < 5%, and output
  one of three verdicts with exact ratios shown.
- **FR-006**: Every Halal verdict must be accompanied by the disclaimer
  "التحقق النهائي من الحلية يقع على عاتق المستخدم" — this is non-negotiable.
- **FR-007**: The full UI must be available in Arabic (primary) and English
  (secondary), including all labels, scores, tooltips, and AI summaries. The
  layout must be fully responsive supporting both mobile (≥360px) and desktop
  (≥1280px) viewports from Day 1; Arabic renders RTL, English renders LTR.

**Important (Should — P4–P5, targeted for Days 3–4):**

- **FR-008**: The system must fetch recent news about a searched stock, analyse
  sentiment, and display a structured Arabic summary with four fields:
  ماذا حدث / لماذا يهم / من يتأثر / المدى الزمني.
- **FR-009**: Every structured news summary must carry a sentiment badge
  (إيجابي / محايد / سلبي) and influence the overall traffic-light score.
- **FR-010**: The system must generate a 30-day ARIMA price projection chart
  with 95% confidence bands for stocks with ≥ 1 year of daily price history.
- **FR-011**: Every ARIMA chart must display the disclaimer
  "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة" directly below it.
- **FR-012**: If any external data source (news API, financial API, Halal API,
  LLM) is unavailable, the system must degrade gracefully — displaying
  available data with a visible Arabic warning rather than an error screen.

**Nice-to-have (Could — P6–P7, only if P1–P5 are complete before Day 4 end):**

- **FR-013**: A Sector Explorer page must categorise sectors as
  مستقرة / نمو عالي / حلال-صديقة with one-sentence Arabic explanations.
- **FR-014**: A Budget Allocator must accept budget, risk tolerance, horizon,
  and Halal preference and return 3–5 personalised stock recommendations with
  exact share counts and allocation percentages.
- **FR-015** *(Premium / post-MVP)*: A real-time live price mode must be
  available for premium users, refreshing scores on demand using the latest
  intraday quote. Rate limiting must be enforced (max 5 live refreshes per
  user per minute) to prevent API quota exhaustion. A visible badge must
  distinguish live scores from EOD scores (e.g., "بيانات حية" vs. "نهاية
  الجلسة").

### Key Entities

- **Stock**: Ticker symbol, company name, exchange, current price (EOD),
  data-freshness timestamp, 1-year daily price history, fundamental ratios
  (P/E, debt-to-equity, interest income ratio, revenue growth). Premium variant
  adds intraday live price with last-refresh timestamp.

- **InvestmentReadinessScore**: Numeric value 0–100, traffic-light colour,
  component scores (Volatility, Beta, VaR, Sharpe, Sentiment), timestamp.

- **HalalVerdict**: One of {Halal, PurificationRequired, NonHalal}, underlying
  ratios (debt ratio, interest ratio), purification percentage, data source
  (Musaffa or AAOIFI rules engine).

- **NewsCard**: Stock ticker, publication date, headline (original language),
  structured Arabic summary (4 fields), sentiment label, expected market impact
  category (short-term / long-term).

- **ARIMAProjection**: Stock ticker, historical price series used, 30-day
  projected prices, lower confidence band, upper confidence band, model
  parameters, generation timestamp.

- **SectorGroup**: Category label (Arabic + English), sector names, associated
  example stocks.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user with zero finance background can understand the
  meaning of their traffic-light score and at least one reason behind it without
  external help — verified by 9 out of 10 test observers.

- **SC-002**: The full stock analysis page (traffic-light score + risk metrics +
  Halal verdict) loads and displays real data within 8 seconds of the user
  submitting a search.

- **SC-003**: At least 90% of stocks searched during the demo return a complete
  Halal verdict with exact underlying ratios.

- **SC-004**: At least 60% of stocks searched during the demo return at least
  one structured Arabic news summary.

- **SC-005**: All five mandatory demo scenarios (Single Stock, Budget Allocator,
  Sector Explorer, Risk Alert, ARIMA) execute without errors or blank screens
  during the final May 1 submission video.

- **SC-006**: The Arabic news summaries are readable, grammatically correct
  Arabic — zero untranslated English finance terms appear in the summary body.

- **SC-007**: The Halal disclaimer and the ARIMA disclaimer are visible and
  present on every page where those features are shown — 100% of the time.

- **SC-008**: The system continues to display a traffic-light score using
  math-only data within 8 seconds even when the news API or LLM is deliberately
  disabled — demonstrating graceful degradation.

---

## Assumptions

- The team has 4 members covering Mathematician, Backend, Frontend, and
  AI/Integration roles as defined in the project document.
- API keys for Alpha Vantage or Twelve Data, OpenAI, NewsAPI, and optionally
  Musaffa will be obtained by the team before April 27 end-of-day.
- If Musaffa API access cannot be obtained in time, the AAOIFI-inspired
  built-in rules engine is an acceptable substitute for hackathon judging.
- The target deployment environment is Netlify (frontend) plus any
  container/serverless host for the FastAPI backend — both support free-tier
  usage sufficient for the hackathon demo.
- Portfolio-level features (correlation matrix, watchlist alerts) are out of
  scope for the hackathon MVP. They appear in the project document as
  "Should/Could" and the constitution classifies them as post-Day-4 only.
- The Beginner Academy (glossary pages) is out of scope for the MVP unless
  P1–P5 are fully working before the end of Day 4.
- All ARIMA projections and traffic-light scores are independent analytical
  outputs. The product does not provide regulated or licensed investment advice.
- User accounts and persistent data storage are out of scope for the MVP;
  searches are stateless from the user's perspective.
- All score computations for the MVP use EOD price data refreshed daily.
  Real-time live pricing (FR-015) is a post-MVP premium feature and is not
  required for the hackathon submission.

---

## Clarifications

### Session 2026-04-26

- Q: What are the numeric cutoff thresholds for the 🟢🟡🔴 traffic-light badge? → A: 60–100 = 🟢 Suitable / 35–59 = 🟡 Research More / 0–34 = 🔴 High Caution
- Q: What is the primary target device and layout direction? → A: Responsive equal priority — mobile (≥360px) and desktop (≥1280px) both supported from Day 1; Arabic RTL, English LTR
- Q: Are stock scores based on real-time or end-of-day data? → A: EOD data refreshed daily for all users (MVP); real-time live pricing is a post-MVP premium feature with rate limiting (max 5 refreshes/user/min)
- Q: How should the system handle stocks with < 90 days of price history (e.g., IPOs)? → A: Show score with "ثقة منخفضة — بيانات محدودة" badge; mark Volatility/Beta/VaR/Sharpe as "غير متاح" with explanatory tooltip
- Q: What are the Investment Readiness Score component weights? → A: Volatility 25% / VaR 25% / Sharpe 20% / Beta 15% / News Sentiment 15%
