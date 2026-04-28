<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.1 → 1.2.0
Amendment rationale:
  MINOR bump — New Principle X (Competitive Intelligence & Product
  Differentiation) added. Full competitive analysis of 8 reference platforms
  encoded as actionable guidelines and a tiered feature roadmap. No existing
  principles changed; no gates removed or weakened.
Modified principles:
  None (all existing principles I–IX unchanged)
Added sections:
  - X. Competitive Intelligence & Product Differentiation
    (landscape table, feature gap analysis, UX patterns, methodologies,
     prioritized roadmap items: Risk Wizard, Purification Calc, Zakat Calc,
     Compliance Alerts, AI Chat, Halal Model Portfolios, Technical Summary)
Templates requiring updates:
  ✅ plan-template.md — Constitution Check gate updated to reference I–X
  ✅ spec-template.md — No change required
  ✅ tasks-template.md — No change required
Follow-up TODOs:
  - TODO(STRIPE_KEY): Add real Stripe publishable key to .env before launch
  - TODO(ENTERPRISE_CONTACT): Replace pricing contact placeholder with real form/email
  - TODO(AAOIFI_METHODOLOGY): Document exact AAOIFI ratio thresholds used by Halal screener
  - TODO(RISK_WIZARD_SPEC): Create spec for Risk Tolerance Wizard (FR-R01)
  - TODO(PURIFICATION_CALC): Create spec for Dividend Purification Calculator (FR-R02)
  - TODO(ZAKAT_CALC): Create spec for Zakat Calculator (FR-R03)
-->

# سهم ($ahim) Constitution
<!-- Arabic Investment Intelligence for Beginners — SalamHack 2026 -->

## Core Principles

### I. Demo-Day First (Scope Discipline)

Every implementation decision MUST be evaluated against a single question:
"Does this ship a working feature before May 1st, 23:59?" Must-have features
(FR-001 through FR-007) are built to completion before any Should/Could
feature is touched. A half-built feature MUST NOT appear in the final demo.
If time pressure forces a cut, remove the feature entirely rather than
shipping a broken version.

**Rationale**: Hackathon scoring explicitly requires "النموذج الأولي منفذ ويعمل
بصورة صحيحة" (prototype executes and works correctly). A polished, working
subset scores higher than an ambitious, broken full product.

### II. MVP Vertical Slices

Each requirement MUST be delivered as a complete end-to-end slice:
UI component → API endpoint → data source. No work begins on a subsequent
slice until the current slice is demonstrable with real (not mocked) data.
The priority order is: Traffic-Light Score → Math Risk Engine → Halal
Screener → Arabic News Agent → Bilingual UI → Should-priority features.

**Rationale**: Judges evaluate live demos. A vertically complete feature at
each progress check (Apr 29, Apr 30) is more valuable than horizontally
partial work across all features.

### III. Arabic-First Accessibility (NON-NEGOTIABLE)

All user-facing text, labels, scores, explanations, tooltips, and AI
summaries MUST be available in Arabic. The primary user persona is an Arab
beginner investor with zero finance background. If a user cannot understand
the output without prior finance knowledge, the feature has failed its
purpose. Arabic content MUST be authored first; English is secondary.

**Rationale**: The hackathon theme explicitly targets "Arab retail investors."
Track 3 is "Understanding & Managing Money" — comprehension is the product.

### IV. Halal Integrity & Disclaimer Discipline (NON-NEGOTIABLE)

Shariah screening results (Halal / Purification Required / Non-Halal) MUST
always be accompanied by the disclaimer: "التحقق النهائي من الحلية يقع على
عاتق المستخدم" (final Halal determination is the user's responsibility).
Screening data MUST display the exact underlying financial ratios
(Debt/Market Cap, Interest Income/Revenue) that produced the verdict.
Screening results MUST NOT be presented as authoritative religious rulings.

**Rationale**: Legal and ethical obligation. Misrepresenting financial data
as a fatwa creates liability and violates user trust. Under the SalamHack
sandbox, the product architecture is assumed pre-audited by a Sharia Advisory
Board and all financial returns are treated as Profit-Sharing (Musharaka/
Mudarabah), not Interest (Riba) — however the user-facing disclaimer is still
mandatory because the sandbox safe-harbour ends on May 1st.

### V. Regulatory Compliance & Disclaimer Discipline (NON-NEGOTIABLE)

Every risk score, ARIMA price projection, traffic-light rating, and portfolio
recommendation MUST carry the label: "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"
(independent informational analysis, not licensed investment advice). ARIMA
predictions MUST display confidence intervals. This disclaimer is a hard
constraint that cannot be removed for aesthetic or UX reasons.

**Rationale**: Regulatory compliance. Presenting output as investment advice
without licensing constitutes a legal violation in every MENA jurisdiction.
The disclaimer protects users and the product — it does not diminish the
analytical quality of the insights provided. Under the SalamHack sandbox,
the team operates under a Central Bank Regulatory Sandbox License and all
users are assumed pre-KYC/AML verified — but the disclaimer is still
mandatory as an immutable product constraint.

### VI. Graceful Degradation

When any external API (financial data, news aggregator, Halal screening,
LLM) is unavailable or exceeds timeout, the system MUST continue to function
in a reduced mode with a visible, user-friendly Arabic warning rather than
returning an error page or crashing. The math-only score MUST be the fallback
for news/AI failures. The traffic-light score MUST always render, even with
partial data.

**Rationale**: Demo reliability is critical. A live demo failure due to an
upstream API outage cannot be recovered from on stage.

### VII. Security & Data Privacy

API keys MUST be managed via environment variables — never hardcoded,
committed to the repository, or logged. No user financial data (portfolios,
budgets, watchlists) is stored server-side for the MVP. Search queries are
logged anonymously (ticker symbol only, no user identity). All endpoints
handling user input MUST validate and sanitize inputs at the API boundary.

**Rationale**: OWASP Top 10 compliance and responsible data stewardship.
Public GitHub repository exposure makes accidental secret commits
irreversible and high-risk.

## Hackathon Timeline Constraints

The team operates under a strict 5-day delivery schedule. Every task MUST
map to a timeline milestone.

| Day | Date | Milestone | Hard Gate |
|-----|------|-----------|-----------|
| 1 | Apr 27 | Idea form submitted; project scaffold committed; FR-001 (Company Search) and FR-002 (Traffic-Light Score) working with real API data | Teams not submitting idea form are disqualified |
| 2 | Apr 28 | 1-minute prototype video recorded; FR-003 (Math Engine), FR-004 (Technical Indicators), FR-005 (Halal Screener) integrated | Teams not submitting video are disqualified |
| 3 | Apr 29 | Progress review video (≤2 min); FR-008 (Arabic News Agent) and FR-007 (Bilingual UI) functional | Judges evaluate completeness |
| 4 | Apr 30 | Progress review video (≤2 min); Should-priority features (FR-009–FR-012) if time permits; full UI polish | Judges evaluate completeness |
| 5 | May 1 | Code on public GitHub; 5-minute final demo video uploaded; final submission form completed | Hard deadline — no extensions |

Any feature not achievable within this schedule MUST be cut. The team MUST
re-evaluate scope at the end of Day 2 and Day 3 and explicitly decide which
Should/Could features to include or drop.

## Hackathon Sandbox Assumptions

SalamHack 2026 provides a formal safe-harbour for all participants. The
following assumptions are **immutable facts** for the duration of the hackathon
(until May 1st, 23:59). The team MUST NOT spend engineering effort on
compliance infrastructure that these assumptions render unnecessary.

### Regulatory Safe Harbour

- The product operates under a **Central Bank Regulatory Sandbox License**.
  Full legal permission to move funds and hold deposits is assumed.
- All users are assumed to have passed **KYC and AML checks**. No identity
  verification screens need to be built unless they are the core innovation.
- All transactions are pre-authorized. Dispute resolution and fraud-flagging
  systems are out of scope for the MVP.

### Sharia Compliance

- The product architecture and screening logic are assumed **pre-audited by
  a Sharia Advisory Board**. No additional religious compliance review is
  required during the hackathon.
- All financial returns MUST be treated as **Profit-Sharing (Musharaka /
  Mudarabah)**, not Interest (Riba). The underlying interest-free contracts
  are assumed legally active.
- Zakat-eligible assets are assumed pre-flagged in the data. Incidental
  non-compliant income is assumed automatically identified for purification.
  The team MUST NOT build industry-blocking logic (e.g., alcohol, gambling)
  unless it is the explicit core feature.

### Track 3 Specific (Understanding & Managing Money)

- The backend database is **legally recognized as a digital wallet** for
  the hackathon period. No escrow or real-money holding is required.
- All transaction data is assumed **pre-tagged / pre-categorized** (e.g.,
  grocery transactions already labeled as "Food & Dining").
- Users can top up wallets from any local debit card at **0% transaction
  fees**. No payment gateway integration is required for funding flows.

### Technical Mocking Guidelines

Judging criteria are: **Innovation, User Experience, and Technical
Implementation** — not API integration breadth.

- External banking APIs that are not provided MAY be replaced with
  **hardcoded JSON fixtures** in `backend/app/fixtures/`. Fixture files
  MUST be clearly named (e.g., `mock_bank_response.json`) and MUST NOT
  be used in a code path that could reach production without replacement.
- The team MUST focus on the **Golden Path** (perfect transaction/analysis
  flow). Edge-case error flows (e.g., partial data) are handled by Principle
  VI (Graceful Degradation), not by complex validation logic.
- Utility screens (Forgot Password, Upload Passport, etc.) MUST NOT be
  built unless they are part of the unique value proposition.

## SaaS Product & Component Principles

### VIII. SaaS Product Architecture

The product MUST be structured as a SaaS web application with the following
mandatory pages: Landing Page (marketing, hero, features, pricing, CTA),
Authentication pages (Sign Up / Sign In / Password Reset), Dashboard
(personalized post-login home), and service-specific pages (Stock Detail,
Sector Explorer, Portfolio Allocator). No feature page may be accessible
without authentication unless it is the Landing Page or a publicly documented
demo route.

The product MUST enforce a two-tier access model:

- **Free tier**: Company Search, Traffic-Light Score, basic Halal screening
  verdict, and limited news headlines (3 per stock). All Free features MUST
  be fully functional — Free users are not second-class citizens; they are
  the acquisition funnel.
- **Premium/Pro tier**: Live monitoring dashboard, full ARIMA chart with CI
  bands, full news feed with AI summaries, portfolio allocator, sector
  analysis, and advanced risk metrics. Premium gates MUST display a clear,
  non-intrusive upgrade prompt explaining the specific benefit, never a
  generic paywall error.
- **Enterprise tier**: Everything in Pro plus white-label options and priority
  support. Enterprise users reach the team via a dedicated contact form;
  no self-serve billing required for MVP.

Tier checks MUST be enforced server-side (API layer). Client-side tier
gating is cosmetic only and MUST NOT be treated as a security boundary.

**Rationale**: Sustainable product requires a clear monetization path.
Free access drives adoption; Premium monetizes engaged users. Tier logic
isolated at the API boundary prevents bypass and keeps frontend clean.

### IX. Component & Accessibility Standards (NON-NEGOTIABLE)

Every user-facing React component MUST:

1. Be built with Tailwind CSS utility classes — no inline styles, no separate
   CSS files except `globals.css` for base resets. Tailwind's `dark:` and
   `rtl:` variants MUST be used for dark mode and RTL Arabic layout.
2. Support full keyboard navigation: all interactive elements MUST be
   reachable via Tab, activated via Enter/Space, and dismissible via Escape
   where applicable. No mouse-only interaction path is permitted.
3. Include ARIA attributes: `role`, `aria-label`, `aria-describedby`,
   `aria-expanded`, `aria-live` (for dynamic score updates) as appropriate.
   Screen-reader-only text MUST use the `sr-only` Tailwind class, not
   `display:none` or `visibility:hidden`.
4. Be self-contained and reusable: props-driven, no internal API calls.
   Data fetching belongs in page-level components or custom hooks, not
   inside UI primitives.
5. Pass WCAG 2.1 AA contrast ratios. All color choices MUST be verified
   against the Tailwind palette's documented contrast values before commit.

Component file naming: PascalCase, one component per file, co-located in
`frontend/src/components/`. Shared primitive components (Button, Badge,
Card, Modal) MUST live in `frontend/src/components/ui/`.

**Rationale**: Accessibility is a legal requirement in many target markets
and a quality signal to judges. Reusable components reduce duplication and
ensure consistent design language across the SaaS layout.

## Pricing Tiers

> **Placeholder text** — replace with real pricing before public launch.

### Free

**$0 / month** — No credit card required.

- Company search and traffic-light score
- Basic Halal screening verdict (pass/fail)
- 3 news headlines per stock
- Arabic + English UI

*Best for: casual investors exploring the product.*

---

### Pro

**$X / month** — Billed monthly or annually (save Y%).

Everything in Free, plus:

- Full ARIMA 30-day price projection with confidence intervals
- Unlimited AI-powered Arabic news summaries
- Advanced risk dashboard (Beta, VaR, Sharpe Ratio)
- Portfolio allocation optimizer
- Sector heat map and comparison
- Live price monitoring with alerts

*Best for: active retail investors managing their own portfolio.*

---

### Enterprise

**Contact us** — Custom pricing for institutions and advisors.

Everything in Pro, plus:

- White-label branding
- Bulk stock screening (CSV upload)
- Dedicated support and SLA
- API access for integration

*Best for: financial advisors, fintechs, and educational institutions.*

---

> **Disclaimer (mandatory on Pricing page)**: "التحليل المقدم لأغراض معلوماتية
> فقط، وليس نصيحة استثمارية مرخصة. الاشتراك لا يمنح ترخيصاً مالياً."

## Technology Stack & Architecture

The following stack is fixed for this project. Changes require explicit team
consensus and MUST be documented with rationale.

- **Frontend**: Next.js 14+ with Tailwind CSS and shadcn/ui — bilingual
  (Arabic RTL + English LTR), responsive, PWA-capable
- **Component Library**: shadcn/ui primitives extended with project-specific
  components in `frontend/src/components/ui/`. Framer Motion for page
  transitions and micro-animations (keep subtle — no motion for motion's sake).
- **Forms**: react-hook-form + zod for all user input (auth, allocator,
  contact). Validation errors MUST render in the active language.
- **Backend**: FastAPI (Python) — REST API with async handlers
- **Auth**: JWT-based session tokens. Tier claim (`free` / `pro` / `enterprise`)
  embedded in token payload and verified server-side on every protected route.
- **Billing (placeholder)**: Stripe Checkout for Pro subscriptions.
  TODO(STRIPE_KEY): configure after MVP demo.
- **Math Engine**: NumPy, pandas, scipy.stats — volatility, Beta, VaR, Sharpe
- **Prediction**: statsmodels ARIMA — 30-day price projection with CI bands
- **AI Agent**: OpenAI Chat Completions API (gpt-4o-mini, JSON mode) — structured Arabic news summarization
- **Financial Data**: Alpha Vantage or Twelve Data API
- **Halal Screening**: Financial Modeling Prep (FMP) fundamentals data or
  Musaffa API
- **Deployment**: Netlify (frontend) + Render.com free container (backend)

Performance target: traffic-light score + news analysis ≤ 8 seconds for demo.
The backend MUST handle 100 concurrent users during the demo session.

### X. Competitive Intelligence & Product Differentiation

#### Competitive Landscape (Research Date: 2026-04-28)

Eight reference platforms were analyzed across services, UX flow, features,
methods, and monetization. All are direct or adjacent competitors to $ahim.

| Platform | Region | Core Differentiator | Halal Focus | Pricing Model |
|----------|--------|---------------------|-------------|---------------|
| Annuity.org | US | Risk tolerance quiz → product leads | None | Free / lead-gen |
| Nippon India Risk Analyzer | India | 9-question risk profile + asset allocation | None | Free (fund acquisition) |
| CalcXML | US | Embeddable 10-question equity-exposure quiz | None | Free widget |
| Sarwa | UAE (ADGM) | All-in-one passive invest + trade + save | Halal Save option | AUM fee |
| Baraka | UAE (DFSA) | 8,500+ US stocks, AI assistant, auto-invest | Shariah-screened info | Freemium $0/$9.99/$19.99 |
| AIN | MENA | Startup pitch ↔ angel investor matching | Mudarabah/Musharakah | Subscription |
| Islamicly | Global | AAOIFI Shariah screening + purification + Zakat | Core product | ₹999/mo–₹9,999/yr |
| Investing.com | Global | Technical analysis, multi-timeframe signals, Warren AI | None | Freemium |

#### Feature Gap Analysis

Features present in competitors but absent from $ahim, ranked by relevance:

| Gap | Source Platform(s) | Relevance to $ahim | Priority |
|-----|-------------------|-------------------|---------|
| Risk Tolerance Wizard (5–9 questions → Conservative/Moderate/Aggressive profile) | Annuity.org, Nippon, CalcXML | Personalizes Risk Panel recommendations; natural entry point for beginners | **P1** |
| Dividend Purification Calculator (formula: Non-Halal Revenue% × Dividend received) | Islamicly | Direct extension of existing Halal screener; completes the halal UX loop | **P1** |
| Zakat Calculator (2.5% on nisab-eligible portfolio value held ≥ 1 lunar year) | Islamicly | High-value for Muslim investors; zero API cost | **P1** |
| Halal Compliance Change Alerts (notify user when stock flips Halal ↔ Non-Halal) | Islamicly | Extends live monitoring; high engagement; premium feature candidate | **P1** |
| Technical Analysis Signal Summary (MA5–MA200 + RSI + MACD → single buy/sell verdict per timeframe) | Investing.com | Consolidates indicators already computed into a headline verdict | **P2** |
| Pre-built Halal Model Portfolios ("Moons" equivalent — curated beginner baskets) | Islamicly | Complements allocator; removes decision paralysis for beginners | **P2** |
| AI Investment Chat Assistant (natural language Q&A on stock data and analysis) | Baraka (baraka AI) | Extends news_agent to conversational interface; leverages existing OpenAI integration | **P2** |
| Income Center / Dividend Tracker (daily projected dividend income per holding) | Baraka | Useful for income-seeking investors; lower priority for MVP | **P3** |
| Broker Portfolio Import (connect broker → auto-import holdings) | Islamicly, Sarwa | High value but requires OAuth per broker; post-MVP only | **P3** |
| Auto-Invest / Recurring Plans | Baraka, Sarwa | Requires payment integration; out of MVP scope | **OUT** |
| Startup / Angel Investment Matching | AIN | Out of scope — different product category | **OUT** |

#### UX Patterns to Adopt

The following UX flows observed in competitors MUST be evaluated when
designing any new feature page:

1. **Step-by-step onboarding wizard** (Annuity.org, Nippon): The Risk Tolerance
   Wizard MUST use a one-question-per-screen progressive format with a progress
   indicator. All radio choices MUST be tappable on mobile. Result screen MUST
   show the risk label (Conservative / Moderate / Aggressive) and 3 recommended
   action steps in Arabic.

2. **"60-second value hook" before sign-up** (Islamicly): A guest-accessible
   quick scan — enter one ticker, get an instant Halal compliance badge and
   traffic-light score — MUST appear on the Landing page. This is the primary
   conversion funnel. The gate fires after the first result, not before.

3. **Plan comparison table with feature checkmarks** (Baraka): The Pricing page
   MUST use a 3-column comparison table (Free / Pro / Enterprise) with explicit
   per-feature checkmarks. The upgrade prompt from a gated feature MUST deep-link
   to the relevant row in the comparison table.

4. **Compliance badge on every stock mention** (Islamicly): The Halal
   status badge (حلال / غير حلال / يحتاج تطهير) MUST appear inline next to
   the stock ticker everywhere it appears — search results, dashboard, news
   headlines — not only on the dedicated Halal Panel.

5. **Methodology transparency** (Islamicly, Annuity.org): Every computed score
   (traffic-light, risk, Halal) MUST expose a "How is this calculated?" expandable
   section that shows the exact formula, data sources, and thresholds in Arabic.
   Users MUST NOT be asked to trust a black box.

#### Methodologies to Standardize

The following calculation methodologies are validated by competitors and MUST
be adopted when implementing the corresponding features:

- **Risk Tolerance Scoring**: Weighted questionnaire (8 questions). Dimensions:
  investment horizon (25%), age group (15%), market knowledge (15%), income
  stability (15%), drawdown tolerance (20%), holding patience (10%). Score
  0–40 → Conservative; 41–70 → Moderate; 71–100 → Aggressive.

- **Dividend Purification**: `Purification Amount = (Non-Halal Revenue /
  Total Revenue) × Gross Dividend Received`. Source ratio from Halal screener
  fundamentals data. Result displayed in AED/USD and as a % of dividend.

- **Zakat Calculation**: `Zakat Due = 2.5% × (Portfolio Value − Liabilities)`
  where portfolio has been held above nisab threshold (≡ 85g gold value) for
  one complete lunar year. Nisab value fetched from gold price API or hardcoded
  as a configurable constant.

- **Technical Summary Signal**: For each timeframe (1H, 1D, 1W), compute:
  - Moving Average votes: MA5, MA10, MA20, MA50, MA100, MA200 (price vs MA = Buy/Sell)
  - Indicator votes: RSI(14), MACD(12,26), ADX(14), Williams %R, CCI(14), ROC
  - Summary = Strong Buy (≥80% Buy), Buy (60–79%), Neutral (40–59%),
    Sell (20–39%), Strong Sell (<20%).

- **AAOIFI Halal Screening Thresholds** (align with Islamicly standard):
  - Debt / Market Cap < 33%
  - Interest Income / Total Revenue < 5%
  - Non-Compliant Revenue / Total Revenue < 5%
  - Cash + Receivables / Market Cap < 33% (asset test)
  `TODO(AAOIFI_METHODOLOGY): Confirm exact thresholds with Halal screener data source.`

#### Competitive Principle (NON-BINDING)

$ahim MUST NOT be a generic stock screener. The product's differentiation MUST
remain: Arabic-first, halal-native, beginner-safe. Every new feature evaluated
against competitors MUST pass this filter: "Does this make Islamic investing
more accessible to an Arabic-speaking beginner, or does it add complexity
that serves experienced traders?" Features that serve only experienced traders
without a halal or Arabic angle MUST be deprioritized.

**Rationale**: Sarwa and Baraka are well-capitalized incumbents in the MENA
investing space. $ahim cannot win on breadth of tradeable assets or execution
speed. It wins on Shariah trust, Arabic comprehension, and beginner guidance
— the intersection that neither competitor fully owns.

## Governance

This constitution supersedes all other team practices and verbal agreements.
Amendments require a written rationale, a version increment, and update of
the `Last Amended` date. All implementation tasks generated by `/speckit.tasks`
MUST include a Constitution Check gate verifying compliance with Principles
I–X before any Phase 3+ task begins.

Principles I (Demo-Day First), III (Arabic-First), IV (Halal Integrity),
V (Regulatory Compliance), VII (Security), and IX (Component & Accessibility)
are NON-NEGOTIABLE — they cannot be removed or deferred under any timeline
pressure. Principle VIII (SaaS Product Architecture) tier-gating rules are
NON-NEGOTIABLE for security; page structure may be scoped for MVP.
Principle X (Competitive Intelligence) is ADVISORY — it guides prioritization
but does not block shipping.

**Version**: 1.2.0 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-04-28
