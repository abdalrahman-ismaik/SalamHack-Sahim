<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1
Modified principles: I (must-have FR list), Timeline (FR IDs corrected), Technology Stack (deployment + AI API)
Amendment rationale:
  - Principle I + Timeline: corrected FR IDs from two-digit to three-digit form to match spec.md;
    removed FR-013 (Sector Explorer) from must-have list — spec classifies it as Could/P6.
    Day 2 Halal gate corrected from FR-007 to FR-005; Day 3 News/UI gate corrected from
    FR-06/FR-13 to FR-008/FR-007.
  - Technology Stack: Deployment updated from Vercel to Netlify + Render.com (per research.md
    Decision 8, previously updated in all plan artifacts but missed in constitution).
    AI Agent updated from "OpenAI Responses API" to "OpenAI Chat Completions API (gpt-4o-mini,
    JSON mode)" to match the researched and implemented approach in research.md + tasks.md.
Templates requiring updates: none — no template placeholder change
Follow-up TODOs: none
Added sections:
  - Core Principles (7 principles)
  - Hackathon Timeline Constraints
  - Technology Stack & Architecture
  - Governance
Templates requiring updates:
  ✅ plan-template.md — Constitution Check gates align with 7 principles
  ✅ spec-template.md — Compliance/Legal section referenced in NFR framing
  ✅ tasks-template.md — Timeline phases match hackathon day structure
Follow-up TODOs: none — all placeholders resolved
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
as a fatwa creates liability and violates user trust.

### V. Regulatory Compliance & Disclaimer Discipline (NON-NEGOTIABLE)

Every risk score, ARIMA price projection, traffic-light rating, and portfolio
recommendation MUST carry the label: "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"
(independent informational analysis, not licensed investment advice). ARIMA
predictions MUST display confidence intervals. This disclaimer is a hard
constraint that cannot be removed for aesthetic or UX reasons.

**Rationale**: Regulatory compliance. Presenting output as investment advice
without licensing constitutes a legal violation in every MENA jurisdiction.
The disclaimer protects users and the product — it does not diminish the
analytical quality of the insights provided.

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

## Technology Stack & Architecture

The following stack is fixed for this project. Changes require explicit team
consensus and MUST be documented with rationale.

- **Frontend**: Next.js 14+ with Tailwind CSS and shadcn/ui — bilingual
  (Arabic RTL + English LTR), responsive, PWA-capable
- **Backend**: FastAPI (Python) — REST API with async handlers
- **Math Engine**: NumPy, pandas, scipy.stats — volatility, Beta, VaR, Sharpe
- **Prediction**: statsmodels ARIMA — 30-day price projection with CI bands
- **AI Agent**: OpenAI Chat Completions API (gpt-4o-mini, JSON mode) — structured Arabic news summarization
- **Financial Data**: Alpha Vantage or Twelve Data API
- **Halal Screening**: Financial Modeling Prep (FMP) fundamentals data or
  Musaffa API
- **Deployment**: Netlify (frontend) + Render.com free container (backend)

Performance target: traffic-light score + news analysis ≤ 8 seconds for demo.
The backend MUST handle 100 concurrent users during the demo session.

## Governance

This constitution supersedes all other team practices and verbal agreements.
Amendments require a written rationale, a version increment, and update of
the `Last Amended` date. All implementation tasks generated by `/speckit.tasks`
MUST include a Constitution Check gate verifying compliance with Principles
I–VII before any Phase 3+ task begins.

Principles I (Demo-Day First), III (Arabic-First), IV (Halal Integrity),
V (Regulatory Compliance), and VII (Security) are NON-NEGOTIABLE — they cannot
be removed or deferred under any timeline pressure.

**Version**: 1.0.1 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-04-26
