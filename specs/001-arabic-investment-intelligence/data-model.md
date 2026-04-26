# Data Model: sSsahim — Arabic Investment Intelligence

**Phase 1 output** | **Date**: 2026-04-26 | **Branch**: `001-arabic-investment-intelligence`

All entities map directly to spec.md FR-001–FR-015 and research.md decisions.
Python types use Pydantic v2 conventions; TypeScript types are the frontend mirror.

---

## Entity: Stock

Represents a publicly traded equity as returned from the market data provider.

### Fields

| Field | Type | Nullable | Validation | Notes |
|-------|------|----------|-----------|-------|
| `ticker` | `str` | No | 1–10 uppercase alphanumeric; regex `^[A-Z0-9.]{1,10}$` | e.g. `2222.SR`, `AAPL`, `COMI.CA` |
| `company_name` | `str` | No | 1–200 chars | Prefer Arabic name if available from provider |
| `exchange` | `str` | No | 1–20 chars | e.g. `TADAWUL`, `NASDAQ`, `EGX` |
| `sector` | `str` | Yes | 1–100 chars | Used for Halal business-activity screen |
| `current_price` | `float` | No | > 0 | EOD close price; currency in local currency |
| `currency` | `str` | No | ISO 4217, 3 chars | e.g. `SAR`, `USD`, `EGP` |
| `price_date` | `date` | No | ≤ today | EOD session date |
| `market_cap` | `float` | Yes | > 0 if present | Used in Halal debt screen |
| `days_of_history` | `int` | No | ≥ 0 | Count of OHLCV rows retrieved |

### Validation Rules

- `ticker` must match regex `^[A-Z0-9.]{1,10}$`; reject with 422 otherwise.
- `current_price` must be > 0; if provider returns 0 or null → raise `DataUnavailableError`.
- If `days_of_history < 90`, downstream services must set `low_confidence = True` on
  `InvestmentReadinessScore`.

### Relationships

- One Stock → One `InvestmentReadinessScore`
- One Stock → One `HalalVerdict`
- One Stock → List[`NewsCard`] (0–5)
- One Stock → One `ARIMAProjection` (may be absent if history < 252 days)

---

## Entity: InvestmentReadinessScore

The composite 0–100 risk score with traffic-light band.

### Fields

| Field | Type | Nullable | Validation | Notes |
|-------|------|----------|-----------|-------|
| `ticker` | `str` | No | Foreign key to Stock | |
| `total_score` | `float` | No | 0–100 inclusive | Final weighted score |
| `band` | `Literal["green","yellow","red"]` | No | Derived from total_score | `green` = 60–100, `yellow` = 35–59, `red` = 0–34 |
| `volatility_score` | `float` | No | 0–100 | Normalised component |
| `var_score` | `float` | No | 0–100 | Normalised component |
| `sharpe_score` | `float` | No | 0–100 | Normalised component |
| `beta_score` | `float` | No | 0–100 | Normalised component |
| `sentiment_score` | `float` | No | 0–50–80–100 bucket | Derived from news sentiment |
| `volatility_raw` | `float` | Yes | ≥ 0 | Annualised σ; null if low_confidence |
| `var_raw` | `float` | Yes | 0–1 | 95% 1-day VaR as decimal; null if low_confidence |
| `sharpe_raw` | `float` | Yes | Any | Annualised Sharpe ratio; null if low_confidence |
| `beta_raw` | `float` | Yes | Any | β vs. local MENA index; null if low_confidence |
| `rsi` | `float` | Yes | 0–100 | 14-day RSI; displayed separately in UI |
| `macd_value` | `float` | Yes | Any | MACD line |
| `macd_signal` | `float` | Yes | Any | MACD signal line |
| `pe_ratio` | `float` | Yes | Any | Price-to-earnings ratio |
| `low_confidence` | `bool` | No | Default False | True when `days_of_history < 90` |
| `benchmark_index` | `str` | No | 1–20 chars | e.g. `^TASI`, `^EGX30`, `^GSPC` |
| `computed_at` | `datetime` | No | UTC | When score was computed |
| `data_freshness_label` | `str` | No | Non-empty | Arabic: "آخر تحديث: نهاية جلسة أمس" |

### Derived Field: band

```python
if total_score >= 60:
    band = "green"
elif total_score >= 35:
    band = "yellow"
else:
    band = "red"
```

### Validation Rules

- `volatility_raw`, `var_raw`, `sharpe_raw`, `beta_raw` MUST be null (not 0)
  when `low_confidence = True`. Setting to 0 would falsely indicate zero risk.
- `data_freshness_label` is always "آخر تحديث: نهاية جلسة أمس" for EOD data.
  Post-MVP: real-time label overrides this.

---

## Entity: HalalVerdict

The Halal compliance screening result. The disclaimer field is NON-REMOVABLE.

### Fields

| Field | Type | Nullable | Validation | Notes |
|-------|------|----------|-----------|-------|
| `ticker` | `str` | No | Foreign key to Stock | |
| `verdict` | `Literal["halal","review","haram"]` | No | Derived | `halal`=🟢, `review`=🟡, `haram`=🔴 |
| `source` | `Literal["musaffa","builtin"]` | No | | Which engine produced this verdict |
| `debt_ratio` | `float` | Yes | 0–1 | `total_debt / market_cap` |
| `interest_ratio` | `float` | Yes | 0–1 | `interest_income / total_revenue` |
| `purification_pct` | `float` | Yes | 0–1 | Non-null when verdict = `review` |
| `business_activity_flag` | `bool` | No | | True if sector is in prohibited list |
| `reasons` | `list[str]` | No | 0–3 items | Human-readable Arabic reason strings |
| `disclaimer` | `str` | No | NON-REMOVABLE | Always: "التحقق النهائي من الحلية يقع على عاتق المستخدم" |
| `screened_at` | `datetime` | No | UTC | |

### Validation Rules

- `disclaimer` field MUST always equal exactly:
  `"التحقق النهائي من الحلية يقع على عاتق المستخدم"`.
  It is set at the class level and cannot be overridden.
- When `verdict = "review"`, `purification_pct` must not be null.
- When `business_activity_flag = True`, `verdict` must be `"haram"`.

### State Transitions

```
Data fetched
    ↓
Business activity in prohibited list?
    yes → verdict = "haram", business_activity_flag = True
    no  ↓
debt_ratio > 0.33?
    yes → verdict = "haram"
    no  ↓
interest_ratio > 0.05?
    yes → verdict = "haram"
    no  ↓
interest_ratio > 0.00 AND ≤ 0.05?
    yes → verdict = "review", purification_pct = interest_ratio
    no  → verdict = "halal"
```

---

## Entity: NewsCard

A single structured news item as summarised by the AI agent.

### Fields

| Field | Type | Nullable | Validation | Notes |
|-------|------|----------|-----------|-------|
| `ticker` | `str` | No | Foreign key to Stock | |
| `source_url` | `str` | Yes | Valid URL or null | Original article URL |
| `source_name` | `str` | Yes | 1–100 chars | Publisher name |
| `published_at` | `datetime` | Yes | | Original publish timestamp |
| `what_happened` | `str` | No | 1–300 chars Arabic | Arabic summary field 1 |
| `why_it_matters` | `str` | No | 1–300 chars Arabic | Arabic summary field 2 |
| `who_is_affected` | `str` | No | 1–300 chars Arabic | Arabic summary field 3 |
| `time_horizon` | `Literal["short","long"]` | No | | short = < 1 month |
| `sentiment` | `Literal["positive","neutral","negative"]` | No | | Used in score engine |
| `fallback_mode` | `bool` | No | Default False | True when OpenAI timed out / errored |

### Validation Rules

- All Arabic text fields (`what_happened`, `why_it_matters`, `who_is_affected`)
  MUST be non-empty Arabic strings. If the LLM returns empty or non-Arabic text,
  the backend falls back to `fallback_mode = True`.
- When `fallback_mode = True`, display the Arabic fallback message:
  "تعذّر تحميل الأخبار في الوقت الحالي — يُعرض التقييم بناءً على البيانات الرياضية فقط"
- Upstream: `sentiment = "neutral"` if `fallback_mode = True`.

---

## Entity: ARIMAProjection

A 30-day price forecast with 95% confidence interval bands.

### Fields

| Field | Type | Nullable | Validation | Notes |
|-------|------|----------|-----------|-------|
| `ticker` | `str` | No | Foreign key to Stock | |
| `forecast_dates` | `list[date]` | No | Length = 30 | Calendar dates (not trading days) |
| `forecast_prices` | `list[float]` | No | Length = 30; all > 0 | Projected EOD price |
| `ci_upper` | `list[float]` | No | Length = 30 | 95% CI upper bound |
| `ci_lower` | `list[float]` | No | Length = 30; ci_lower[i] > 0 | 95% CI lower bound |
| `arima_order` | `tuple[int, int, int]` | No | p,d,q each 0–5 | Best (p,d,q) by AIC |
| `aic_score` | `float` | No | | AIC of winning model |
| `base_price` | `float` | No | > 0 | Last known EOD price |
| `insufficient_data` | `bool` | No | Default False | True if history < 252 days |
| `disclaimer` | `str` | No | NON-REMOVABLE | Always: "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة" |

### Validation Rules

- `disclaimer` MUST always equal:
  `"هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"`.
- When `insufficient_data = True`, `forecast_prices`, `ci_upper`, `ci_lower`
  may be empty lists. The UI shows the Arabic message but no chart.
- `ci_lower[i]` must never be < 0. If the statistical CI lower bound goes
  negative, clamp to 0 (stock price cannot be negative).

---

## Entity: SectorGroup

A market sector with aggregated performance statistics (P6 — Could feature).

### Fields

| Field | Type | Nullable | Validation | Notes |
|-------|------|----------|-----------|-------|
| `sector_name` | `str` | No | 1–100 chars | Arabic sector name preferred |
| `exchange` | `str` | No | 1–20 chars | e.g. `TADAWUL` |
| `avg_score` | `float` | Yes | 0–100 | Avg InvestmentReadinessScore across sector |
| `avg_return_1y` | `float` | Yes | | Average 1-year return across sector tickers |
| `top_tickers` | `list[str]` | No | Max 5 tickers | Highest-scored tickers in sector |
| `halal_pct` | `float` | Yes | 0–1 | Fraction of tickers with Halal verdict |

---

## Entity: BudgetAllocation

An allocation plan splitting an investment amount across stocks (P7 — Could feature).

### Fields

| Field | Type | Nullable | Validation | Notes |
|-------|------|----------|-----------|-------|
| `total_budget` | `float` | No | > 0 | User-supplied budget in local currency |
| `currency` | `str` | No | ISO 4217 | |
| `tickers` | `list[str]` | No | 1–10 tickers | User-supplied basket |
| `allocations` | `list[AllocationItem]` | No | len = len(tickers) | Per-ticker allocation |
| `disclaimer` | `str` | No | NON-REMOVABLE | Always: "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة" |
| `generated_at` | `datetime` | No | UTC | |

### AllocationItem (nested)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `ticker` | `str` | No | |
| `pct` | `float` | No | 0–1; all pct sum = 1.0 |
| `amount` | `float` | No | > 0; `pct * total_budget` |
| `score` | `float` | No | InvestmentReadinessScore used for weighting |

**Allocation logic**: Score-proportional weighting. Tickers with Halal verdict
`"haram"` are excluded automatically (their weight is redistributed).

---

## Relationships Diagram

```
Stock (ticker)
├── InvestmentReadinessScore  (1:1)
│   └── uses → 252d OHLCV via market_data.py
├── HalalVerdict              (1:1)
│   └── uses → fundamentals via halal_screener.py
├── NewsCard[]                (1:0..5)
│   └── uses → NewsAPI + OpenAI via news_agent.py
└── ARIMAProjection           (1:0..1)
    └── uses → 252d OHLCV via arima_service.py

SectorGroup          (independent — aggregates many Stocks)
BudgetAllocation     (independent — user request, aggregates many Stocks)
```

---

## TypeScript Mirror Types (Frontend)

```typescript
// src/lib/types.ts

export type ScoreBand = "green" | "yellow" | "red";
export type HalalVerdict = "halal" | "review" | "haram";
export type Sentiment = "positive" | "neutral" | "negative";
export type TimeHorizon = "short" | "long";

export interface Stock {
  ticker: string;
  companyName: string;
  exchange: string;
  sector?: string;
  currentPrice: number;
  currency: string;
  priceDate: string; // ISO date
  daysOfHistory: number;
}

export interface InvestmentReadinessScore {
  ticker: string;
  totalScore: number;
  band: ScoreBand;
  volatilityScore: number;
  varScore: number;
  sharpeScore: number;
  betaScore: number;
  sentimentScore: number;
  volatilityRaw?: number;
  varRaw?: number;
  sharpeRaw?: number;
  betaRaw?: number;
  rsi?: number;
  macdValue?: number;
  macdSignal?: number;
  peRatio?: number;
  lowConfidence: boolean;
  benchmarkIndex: string;
  dataFreshnessLabel: string; // e.g. "آخر تحديث: نهاية جلسة أمس"
}

export interface HalalVerdictData {
  ticker: string;
  verdict: HalalVerdict;
  source: "musaffa" | "builtin";
  debtRatio?: number;
  interestRatio?: number;
  purificationPct?: number;
  businessActivityFlag: boolean;
  reasons: string[];
  disclaimer: string; // NON-REMOVABLE Arabic string
}

export interface NewsCard {
  ticker: string;
  sourceUrl?: string;
  sourceName?: string;
  publishedAt?: string;
  whatHappened: string;
  whyItMatters: string;
  whoIsAffected: string;
  timeHorizon: TimeHorizon;
  sentiment: Sentiment;
  fallbackMode: boolean;
}

export interface ARIMAProjection {
  ticker: string;
  forecastDates: string[];
  forecastPrices: number[];
  ciUpper: number[];
  ciLower: number[];
  arimaOrder: [number, number, number];
  basePrice: number;
  insufficientData: boolean;
  disclaimer: string; // NON-REMOVABLE Arabic string
}

export interface StockAnalysis {
  stock: Stock;
  score: InvestmentReadinessScore;
  halal: HalalVerdictData;
  news: NewsCard[];
  arima?: ARIMAProjection;
}
```
