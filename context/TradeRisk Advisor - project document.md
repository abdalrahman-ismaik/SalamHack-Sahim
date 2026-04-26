# **TradeRisk Advisor**
## *The First Arabic-Native, MENA-Focused Investment Guardrail with Halal Finance Intelligence*

---

## **1. Problem Statement Canvas**
*Based on the Design Thinking framework — mapping the root cause, not the symptom.*

| **CONTEXT** | **PROBLEM** | **ALTERNATIVES** |
|:---|:---|:---|
| **When does the problem occur?** Every time an Arab retail investor considers buying a stock, monitors an existing holding, or receives a "hot tip" from social media. Occurs daily during market hours, during earnings seasons, and spikes during geopolitical volatility or oil price shocks. | **What is the root cause?** Most retail investors in the MENA region invest based on gut feeling, social media hype, or unverified tips from Telegram groups. They lack access to affordable, localized risk assessment tools. Existing platforms are built for US/European investors, ignore Halal compliance needs, overwhelm users with complex financial jargon, and fail to account for MENA-specific risks (currency devaluation, oil sensitivity, thin liquidity). | **What do customers do now to fix the problem?** <br>1. Use US-centric apps (Yahoo Finance, TradingView) with no MENA context or Halal screening.<br>2. Follow Telegram/Twitter stock tips with no risk disclosure.<br>3. Rely on bank brokerages that are execution-only with minimal research.<br>4. Subscribe to expensive research reports they cannot fully understand. |

| **CUSTOMERS** | **EMOTIONAL & QUANTIFIABLE IMPACT** | **ALTERNATIVE SHORTCOMINGS** |
|:---|:---|:---|
| **Who has the problem most often?** Arab retail investors aged 22–45, earning $1,000–$10,000/month, with 0–3 years of market experience. Includes a large subset of Islamic finance-conscious users who need to verify Halal compliance before investing. | **Emotional:** Anxious about losing money, confused by financial ratios (Beta, VaR, Sharpe), guilty if unknowingly investing in interest-heavy (riba) companies, FOMO-driven by social media "gurus," embarrassed when losses occur.<br><br>**Quantifiable:** 70–80% of retail traders lose money in their first year; average first-year loss $2,000–$5,000; users waste 10+ hours/week researching across fragmented sources with no clear risk conclusion. | **1. US platforms** (Morningstar, Seeking Alpha) lack Tadawul/EGX/ADX coverage and Halal logic.<br>**2. Social media tips** have zero accountability, no risk metrics, and no transparency.<br>**3. Bank brokerages** provide execution but no personalized risk guardrails.<br>**4. Existing tools** are English-only and culturally disconnected from Arab investors. |

---

## **2. Value Proposition**

> **"We help MENA retail investors make confident, Halal-compliant investment decisions by combining mathematical risk models, AI-powered Arabic news analysis, and automated Shariah screening into one simple, actionable score."**

**The "Super Mario" Translation:**
- **Your potential customer:** An anxious first-time investor in Riyadh or Cairo who wants to grow wealth but fears losing money and accidentally violating Islamic finance principles.
- **Your product:** A unified risk-and-value intelligence layer.
- **The outcome:** An empowered investor who understands *exactly* what they are buying, how risky it is, whether it is Halal, and how it fits their budget — before they click "buy."

---

## **3. Business Model Canvas (BMC)**

| **Building Block** | **Description** |
|:---|:---|
| **Customer Segments** | Primary: Arab retail investors (22–45) in KSA, UAE, Egypt, Kuwait, and Jordan. Secondary: Islamic finance-conscious investors globally who need automated Halal screening. Tertiary: MENA fintech apps seeking white-label risk APIs. |
| **Value Propositions** | 1. **Unified Risk Score:** One number (0–10) combining volatility, financial health, market risk, and news sentiment. <br>2. **Halal Intelligence:** Automated Shariah screening with purification ratios, not just a binary flag. <br>3. **MENA-Native:** Local market data (Tadawul, EGX, ADX), Arabic NLP news analysis, and regional geopolitical risk overlays. <br>4. **Budget Allocator:** Suggests specific companies and share quantities based on user budget and risk tolerance. |
| **Channels** | Web platform (MVP), mobile-responsive PWA, Telegram bot for alerts, API for B2B fintech partnerships. |
| **Customer Relationships** | Self-service dashboard + AI chatbot for plain-language explanations. Community-driven Halal verification feedback loop. |
| **Revenue Streams** | **Freemium:** Basic risk scores + 3 searches/day free. <br>**Premium ($9.99/month):** Unlimited searches, portfolio correlation heatmap, AI news agent, Halal purification calculator, scenario simulator. <br>**B2B API:** White-label risk engine for MENA neobanks and brokerage apps. |
| **Key Resources** | Mathematician/data scientist (proprietary risk algorithms), financial data APIs (yfinance, FMP), Arabic NLP model, Halal finance rule engine, cloud infrastructure. |
| **Key Activities** | Risk algorithm refinement, Arabic news source integration, Halal database maintenance, user education content creation. |
| **Key Partnerships** | Financial data providers (FMP, Alpha Vantage), Islamic finance certification bodies, MENA stock exchanges (data licensing), NewsAPI + Arabic news aggregators. |
| **Cost Structure** | Data API subscriptions, cloud hosting (Render/Vercel), LLM API costs (Claude/OpenAI), compliance/legal review for financial advice disclaimers. |

---

## **4. Software Requirements Specification (SRS)**

### **4.1 Functional Requirements**

| **ID** | **Requirement** | **Priority** |
|:---|:---|:---:|
| **FR-01** | **Company Search:** User can search any stock by ticker or company name (supports US, KSA, UAE, Egypt, Kuwait listings). | Must |
| **FR-02** | **Math Risk Engine:** System calculates Volatility (σ), Beta (vs. local market index), Value at Risk (95% confidence), and Sharpe Ratio using 1-year historical price data. | Must |
| **FR-03** | **Composite Risk Score:** System generates a 0–10 overall risk score using weighted formula: `0.30×Volatility + 0.25×Beta + 0.25×VaR + 0.20×News Sentiment`. | Must |
| **FR-04** | **ARIMA Price Prediction:** Mathematician-built model projects 30-day price trend with confidence intervals. Displayed as a chart with explicit "statistical estimate, not guarantee" disclaimer. | Must |
| **FR-05** | **AI News Agent:** System fetches latest news (English + Arabic), analyzes sentiment (Positive/Negative/Neutral), extracts risk signals (earnings misses, lawsuits, geopolitical events), and generates a plain-language risk summary. | Must |
| **FR-06** | **Halal Screening Engine:** System evaluates: (a) business activity (no alcohol, gambling, conventional banking), (b) Debt/Market Cap < 33%, (c) Interest Income/Revenue < 5%. Outputs: Halal / Purification Required / Non-Halal with exact ratios shown. | Must |
| **FR-07** | **Budget Allocator:** User inputs budget, risk tolerance (Low/Medium/High), time horizon, and Halal preference. System filters universe and returns top 3–5 recommendations with share quantities and allocation percentages. | Should |
| **FR-08** | **Portfolio Correlation:** If user selects multiple stocks, system displays correlation matrix and concentration risk warnings (sector/geography). | Should |
| **FR-09** | **Scenario Simulator:** User can stress-test a stock against scenarios: "Oil drops 30%," "Fed hikes 1%," "EGP devalues 20%." System shows estimated impact. | Could |
| **FR-10** | **Bilingual UI:** Full Arabic and English interface. All risk explanations, AI summaries, and tooltips available in both languages. | Must |
| **FR-11** | **Alert System:** User can "watch" a stock. System notifies if risk score changes by >1.5 points or if Halal status changes due to new financial filings. | Could |

### **4.2 Non-Functional Requirements**

| **ID** | **Requirement** |
|:---|:---|
| **NFR-01 Performance** | Risk score calculation + AI news analysis must complete within 8 seconds for MVP demo. |
| **NFR-02 Scalability** | Backend must handle 100 concurrent users during hackathon demo without degradation. |
| **NFR-03 Security** | No user financial data stored. Search queries logged anonymously. API keys encrypted. |
| **NFR-04 Reliability** | If external news API fails, system degrades gracefully (shows math-only risk score with warning). |
| **NFR-05 Usability** | A first-time user must understand their risk score without financial background knowledge. |
| **NFR-06 Compliance** | All predictions labeled as "independent informational analysis, not licensed investment advice." Shariah screening includes disclaimer that final Halal determination is user's responsibility. |

---

## **5. Technical Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT + TAILWIND UI                     │
│         (Bilingual / Dashboard / Charts / Alerts)           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  FASTAPI BACKEND (Python)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Math Engine    │  │  AI Agent       │  │  Halal      │ │
│  │  (NumPy/pandas/ │  │  (NewsAPI +     │  │  Screener   │ │
│  │   scipy/stats)  │  │   Claude/GPT-4) │  │  (FMP data) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  ARIMA Model    │  │  Budget         │                 │
│  │  (statsmodels)  │  │  Allocator      │                 │
│  └─────────────────┘  └─────────────────┘                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐    ┌──────────────┐   ┌──────────────┐
   │ yfinance │    │ Financial    │   │ NewsAPI /    │
   │ (prices) │    │ Modeling Prep│   │ Arabic RSS   │
   └──────────┘    │ (fundamentals)│   └──────────────┘
                   └──────────────┘
```

---

## **6. Innovation & Differentiation**

| **Dimension** | **Global Competitors** | **TradeRisk Advisor** |
|:---|:---|:---|
| **Target Market** | US/European retail investors | MENA retail investors first |
| **Language** | English only | Arabic + English natively |
| **Halal Screening** | Not available or binary flag | Graduated (Halal / Purification / Non-Halal) with exact ratios |
| **News Analysis** | English financial news | Arabic NLP on regional sources (CNBC Arabia, Mubasher, Al Arabiya) |
| **Market Beta** | vs. S&P 500 | vs. Tadawul All Share / EGX 30 |
| **Liquidity Risk** | Ignored (US markets are liquid) | Explicit thin-trading warnings for MENA stocks |
| **FX Risk** | Not relevant to US users | EGP/USD, SAR/USD impact on foreign holdings |
| **Pricing** | $20–$50/month | Freemium + $9.99/month |

---

## **7. Demo Plan (Hackathon MVP)**

**Scenario 1 — Single Stock Analysis:**
User searches "Saudi Aramco (2222.SR)" → System displays:
- Overall Risk Score: 4.2/10 (Low-Medium)
- Math panel: Volatility, Beta vs. Tadawul, VaR, Sharpe
- AI News: "OPEC+ production decision creates mixed sentiment"
- Halal Panel: ✅ Halal (Debt ratio 18%, Interest income 0.2%)
- ARIMA Chart: 30-day projection with confidence band

**Scenario 2 — Budget Allocator:**
User inputs: Budget = $5,000, Risk Tolerance = Medium, Halal = Yes
→ System recommends 3 stocks with exact share counts and allocation split.

**Scenario 3 — Risk Alert:**
User watches a volatile Egyptian stock. AI agent detects negative Arabic news about currency devaluation → Risk score jumps from 6.0 to 8.5 → Alert fires with explanation.

---

## **8. Team Division of Work**

| **Role** | **Responsibility** |
|:---|:---|
| **Mathematician** | Build Volatility, Beta, VaR, Sharpe formulas in Python. Implement ARIMA prediction model. Define composite risk score weights. |
| **Backend Developer** | FastAPI setup, yfinance/FMP integration, database schema, Halal screening logic, API endpoints. |
| **Frontend Developer** | React + Tailwind dashboard, bilingual UI, Recharts/Chart.js visualizations, responsive design. |
| **AI/Integration Lead** | NewsAPI integration, AI agent prompt engineering (Arabic + English), sentiment analysis pipeline, alert system logic. |

---

## **9. Success Metrics (Post-Hackathon)**

| **Metric** | **Target** |
|:---|:---|
| Demo load time | < 5 seconds |
| Risk score accuracy | Correlates >0.75 with professional risk ratings |
| Arabic news coverage | >60% of analyzed stocks have Arabic news summary |
| Halal screening accuracy | Matches Musaffa/Zoya database >90% of time |
| User comprehension | 8/10 first-time users can explain their risk score without help |

---

**Deliverables Checklist for Submission:**
- [x] Problem Statement Canvas
- [x] Value Proposition Statement
- [x] Business Model Canvas
- [x] Software Requirements Specification
- [ ] Live Prototype (React + FastAPI)
- [ ] 3-Minute Demo Video

---