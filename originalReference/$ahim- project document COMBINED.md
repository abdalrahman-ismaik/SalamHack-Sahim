# **سهم ($ahim)**
## *Arabic Investment Intelligence for Beginners*
### *The first platform that turns complex market data and news into a simple traffic-light score — with professional-grade risk monitoring, MENA-specific insights, and automated Halal screening.*

---

## **1. Problem Statement Canvas**
*Root cause analysis, not symptoms.*

| **CONTEXT** | **PROBLEM** | **ALTERNATIVES** |
|:---|:---|:---|
| **When does the problem occur?** Every time a beginner in the Arab world considers investing — whether they receive a "hot tip" on Telegram, read overwhelming English financial news, or wonder if a stock is Halal. Spikes during earnings seasons, geopolitical volatility, oil price shocks, and currency devaluations in MENA markets. | **What is the root cause?** Beginners invest based on gut feeling, social media hype, or unverified tips. They cannot understand complex financial tools, connect news to market impact, or verify Sharia compliance. Existing platforms are built for US experts, overwhelm with jargon, ignore Halal needs, and miss MENA-specific risks (currency devaluation, oil shocks, thin liquidity). | **What do customers do now?** <br>1. Use US-centric apps (Yahoo Finance, TradingView) with no MENA context or Halal screening.<br>2. Follow Telegram/Twitter stock tips with zero risk disclosure.<br>3. Rely on execution-only bank brokerages with no beginner guidance.<br>4. Subscribe to expensive research reports they cannot understand. |

| **CUSTOMERS** | **EMOTIONAL & QUANTIFIABLE IMPACT** | **ALTERNATIVE SHORTCOMINGS** |
|:---|:---|:---|
| **Who has the problem most often?** Arab retail investors aged 22–45, beginners with 0–3 years of experience, earning $1,000–$10,000/month. Includes Muslim users who need to verify Halal compliance and connect news to real market impact before investing. | **Emotional:** Anxious about losing money, confused by financial jargon, guilty if unknowingly investing in interest-heavy (riba) companies, overwhelmed by English news, FOMO-driven by social media "gurus."<br><br>**Quantifiable:** 70–80% of retail traders lose money in their first year; average first-year loss $2,000–$5,000; users waste 10+ hours/week researching fragmented sources with no clear conclusion. | **1. US platforms** lack Tadawul/EGX/ADX coverage and Halal logic.<br>**2. Social media tips** have zero accountability, no risk metrics, and no transparency.<br>**3. Bank brokerages** provide execution but no personalized guidance or education.<br>**4. Existing tools** are English-only, expert-oriented, and culturally disconnected from Arab beginners. |

---

## **2. Value Proposition**

> **"We help Arab beginner investors make confident, informed, and Halal-compliant decisions by combining mathematical risk models, AI-powered Arabic news analysis, and automated Shariah screening into one simple traffic-light score."**

**The "Super Mario" Translation:**
- **Your potential customer:** An anxious first-time investor in Riyadh or Cairo who wants to grow wealth but fears losing money, cannot understand English finance jargon, and worries about accidentally violating Islamic principles.
- **Your product:** A unified Arabic-first investment intelligence layer that explains *why* something matters, *how risky* it is, and *whether it is Halal* — all in one dashboard.
- **The outcome:** An empowered beginner who understands exactly what they are buying, how risky it is, whether it fits their faith, and how much to invest — before they click "buy."

---

## **3. Business Model Canvas (BMC)**

| **Building Block** | **Description** |
|:---|:---|
| **Customer Segments** | Primary: Arab retail beginners (22–45) in KSA, UAE, Egypt, Kuwait, Jordan with 0–3 years experience. Secondary: Islamic finance-conscious investors globally. Tertiary: MENA fintech apps seeking white-label risk + Halal APIs. |
| **Value Propositions** | 1. **Traffic-Light Simplicity:** 🟢 Suitable / 🟡 Research More / 🔴 High Caution — no finance degree required.<br>2. **Arabic News Intelligence:** LLM turns headlines into structured Arabic summaries (what happened → why it matters → who is affected → short/long-term).<br>3. **MENA-Native Risk Engine:** Local market Beta (vs. Tadawul/EGX), oil sensitivity, FX devaluation risk, liquidity warnings.<br>4. **Graduated Halal Screening:** Halal / Purification Required / Non-Halal with exact debt ratios and purification %.<br>5. **Beginner Academy:** Built-in education ("What is Beta?", "What makes a stock non-Sharia-compliant?"). |
| **Channels** | Web platform (MVP), mobile-responsive PWA, Telegram bot for daily Arabic market digest + alerts. |
| **Customer Relationships** | Self-service dashboard + AI chatbot for plain-language explanations. Community-driven Halal verification feedback. |
| **Revenue Streams** | **Freemium:** Basic traffic-light score + 3 searches/day + sector explorer.<br>**Premium ($9.99/month):** Unlimited searches, portfolio correlation heatmap, AI news agent, Halal purification calculator, scenario simulator, beginner academy.<br>**B2B API:** White-label risk + Halal engine for MENA neobanks and brokerage apps. |
| **Key Resources** | Mathematician/data scientist (proprietary risk algorithms), Arabic NLP pipeline, Halal finance rule engine, financial data APIs, cloud infrastructure. |
| **Key Activities** | Risk algorithm refinement, Arabic news source integration, Halal database maintenance, beginner education content creation. |
| **Key Partnerships** | Financial data providers (Alpha Vantage / Twelve Data), Musaffa (Halal API), MENA stock exchanges (data licensing), Arabic news aggregators (NewsAPI + GDELT). |
| **Cost Structure** | Data API subscriptions, cloud hosting, LLM API costs, compliance/legal review for financial advice disclaimers. |

---

## **4. Software Requirements Specification (SRS)**

### **4.1 Functional Requirements**

| **ID** | **Requirement** | **Priority** |
|:---|:---|:---:|
| **FR-01** | **Company Search:** User can search any stock by ticker or company name (supports US, KSA, UAE, Egypt, Kuwait listings). | Must |
| **FR-02** | **Traffic-Light Score:** System displays a primary 🟢🟡🔴 rating based on a 0–100 Investment Readiness Score. | Must |
| **FR-03** | **Math Risk Engine:** System calculates Volatility (σ), Beta (vs. local MENA market index), Value at Risk (95%), and Sharpe Ratio using 1-year historical data. | Must |
| **FR-04** | **Technical Indicators:** System displays RSI, MACD, moving averages, P/E ratio, debt-to-equity, and revenue growth. | Must |
| **FR-05** | **ARIMA Price Prediction:** Mathematician-built model projects 30-day price trend with confidence intervals. Displayed with explicit "statistical estimate, not guarantee" disclaimer. | Must |
| **FR-06** | **Structured Arabic News Agent:** System fetches latest news (English + Arabic), analyzes sentiment, and returns structured output: What happened → Why it matters → Who is affected → Short-term or long-term impact. | Must |
| **FR-07** | **Halal Screening Engine:** System evaluates: (a) business activity (no alcohol, gambling, conventional banking), (b) Debt/Market Cap < 33%, (c) Interest Income/Revenue < 5%. Outputs: 🟢 Halal / 🟡 Purification Required / 🔴 Non-Halal with exact ratios and purification % shown on click. | Must |
| **FR-08** | **Beginner Academy:** Built-in glossary pages explaining financial terms (Beta, VaR, P/E, RSI) and Halal finance principles in simple Arabic. | Should |
| **FR-09** | **Sector Explorer:** Displays "Stable sectors," "High-growth but high-risk sectors," and "Halal-friendly sectors" this week with beginner-friendly explanations. | Should |
| **FR-10** | **Budget Allocator:** User inputs budget, risk tolerance (Low/Medium/High), time horizon, and Halal preference. System filters universe and returns top 3–5 recommendations with exact share counts and allocation percentages. | Should |
| **FR-11** | **Portfolio Correlation:** If user selects multiple stocks, system displays correlation matrix and concentration risk warnings (sector/geography overlap). | Should |
| **FR-12** | **Scenario Simulator:** User can stress-test a stock against MENA-relevant scenarios: "Oil drops 30%," "Fed hikes 1%," "EGP devalues 20%." System shows estimated impact. | Could |
| **FR-13** | **Bilingual UI:** Full Arabic and English interface. All explanations, AI summaries, and tooltips available in both languages. | Must |
| **FR-14** | **Smart Alert System:** User can "watch" a stock. System notifies if traffic-light score changes, Halal status shifts, or major Arabic news breaks. | Could |

### **4.2 Non-Functional Requirements**

| **ID** | **Requirement** |
|:---|:---|
| **NFR-01 Performance** | Traffic-light score + news analysis must complete within 8 seconds for MVP demo. |
| **NFR-02 Scalability** | Backend must handle 100 concurrent users during hackathon demo. |
| **NFR-03 Security** | No user financial data stored. Search queries logged anonymously. API keys encrypted. |
| **NFR-04 Reliability** | If external news API fails, system degrades gracefully (shows math-only score with warning). |
| **NFR-05 Usability** | A first-time user with zero finance background must understand their score without help. |
| **NFR-06 Compliance** | All predictions labeled as "independent informational analysis, not licensed investment advice." Shariah screening includes disclaimer that final Halal determination is user's responsibility. |

---

## **5. Technical Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS + TAILWIND + SHADCN/UI                 │
│    (Bilingual / Traffic-Light Dashboard / Charts / Academy) │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  FASTAPI BACKEND (Python)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Math Engine    │  │  AI Agent       │  │  Halal      │ │
│  │  (NumPy/pandas/ │  │  (OpenAI        │  │  Screener   │ │
│  │   scipy/stats)  │  │   Responses API)│  │  (FMP data) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  ARIMA Model    │  │  Budget         │  │  Beginner   │ │
│  │  (statsmodels)  │  │  Allocator      │  │  Academy    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐    ┌──────────────┐   ┌──────────────┐
   │ yfinance │    │ Alpha Vantage│   │ NewsAPI /    │
   │ (prices) │    │ (indicators  │   │ GDELT        │
   └──────────┘    │  + fundam.)  │   │ (Arabic news)│
                   └──────────────┘   └──────────────┘
```

---

## **6. Investment Readiness Score Formula**

```
Investment Readiness Score (0–100) =
  20% Technical Trend Quality    (RSI, MACD, moving averages)
+ 20% Risk Engine                (VaR, Beta vs. local index, Sharpe)
+ 15% Fundamentals Quality       (P/E, debt, margins, revenue growth)
+ 15% News Sentiment Stability   (structured LLM analysis)
+ 15% MENA Risk Overlay          (oil sensitivity, FX risk, liquidity)
+ 15% Sharia Compliance Confidence

Display:
  🟢 65–100  → Suitable for beginners
  🟡 40–64   → Research more
  🔴 0–39    → High caution
```

---

## **7. Innovation & Differentiation Matrix**

| **Dimension** | **Global Competitors** | **سهم ($ahim)** |
|:---|:---|:---|
| **Target Market** | US/European experts | Arab beginners first |
| **Primary UI** | Complex numbers & charts | Traffic-light simplicity |
| **Language** | English only | Arabic + English natively |
| **News Analysis** | English headlines only | Structured Arabic summaries + MENA sources |
| **Halal Screening** | Not available or binary flag | Graduated with purification % + traffic-light UI |
| **Market Beta** | vs. S&P 500 | vs. Tadawul All Share / EGX 30 |
| **Liquidity Risk** | Ignored | Explicit thin-trading warnings |
| **FX Risk** | Not relevant | EGP/USD, SAR/USD impact on foreign holdings |
| **Education** | None | Built-in Beginner Academy |
| **Sector Discovery** | None | "Halal-friendly sectors this week" |
| **Pricing** | $20–$50/month | Freemium + $9.99/month |

---

## **8. Demo Plan (Hackathon MVP)**

**Scenario 1 — Single Stock Analysis:**
User searches "Saudi Aramco (2222.SR)" → System displays:
- 🟢 **Suitable** (Score: 72/100)
- Math panel: Volatility, Beta vs. Tadawul, VaR, Sharpe, RSI, MACD
- AI News: Structured Arabic summary — "OPEC+ production decision benefits energy sector short-term, but increases inflation pressure on transport."
- Halal Panel: 🟢 Halal (Debt ratio 18%, Interest income 0.2%, Purification: 0%)
- ARIMA Chart: 30-day projection with confidence band
- "Explain Like I'm a Beginner" toggle: *"Beta = 0.8 means this stock is calmer than the overall market."*

**Scenario 2 — Budget Allocator:**
User inputs: Budget = $5,000, Risk Tolerance = Medium, Halal = Yes
→ System recommends 3 stocks with exact share counts, allocation split, and 🟢🟡🔴 ratings.

**Scenario 3 — Sector Explorer:**
User clicks "Explore" → Sees "Halal-friendly sectors this week: Healthcare 🟢, Technology 🟡, Energy 🔴" with one-sentence Arabic explanations.

**Scenario 4 — Risk Alert:**
User watches an Egyptian stock. AI agent detects negative Arabic news about EGP devaluation → Score drops from 🟡 58 to 🔴 35 → Alert fires with structured explanation.

---

## **9. Team Division of Work**

| **Role** | **Responsibility** |
|:---|:---|
| **Mathematician** | Build VaR, Beta, Sharpe formulas in Python. Implement ARIMA prediction model. Define composite score weights. |
| **Backend Developer** | FastAPI setup, Alpha Vantage/yfinance integration, database schema, Halal screening logic, API endpoints. |
| **Frontend Developer** | Next.js + Tailwind + shadcn/ui dashboard, bilingual UI, Recharts visualizations, traffic-light components, Beginner Academy pages. |
| **AI/Integration Lead** | OpenAI Responses API integration, structured Arabic news prompts, NewsAPI/GDELT ingestion, sentiment pipeline, alert system logic. |

---

## **10. Success Metrics (Post-Hackathon)**

| **Metric** | **Target** |
|:---|:---|
| Demo load time | < 5 seconds |
| Traffic-light clarity | 9/10 first-time users understand their score without help |
| Arabic news coverage | >60% of analyzed stocks have Arabic summary |
| Halal screening accuracy | Matches Musaffa/Zoya database >90% of time |
| Risk score correlation | >0.75 with professional risk ratings |
| Beginner comprehension | 8/10 users can explain Beta/VaR after using the academy |

---

**Deliverables Checklist for Submission:**
- [x] Problem Statement Canvas (visual + text)
- [x] Value Proposition Statement
- [x] Business Model Canvas
- [x] Software Requirements Specification
- [ ] Live Prototype (Next.js + FastAPI)
- [ ] 3-Minute Demo Video

---