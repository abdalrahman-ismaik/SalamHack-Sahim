/**
 * TypeScript interfaces matching the backend data-model.md entities.
 */

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
  country: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Investment Readiness Score
// ---------------------------------------------------------------------------

export type ScoreBand = "green" | "yellow" | "red";

export interface ScoreComponents {
  volatility_score: number;
  var_score: number;
  sharpe_score: number;
  beta_score: number;
  sentiment_score: number;
}

export interface InvestmentReadinessScore {
  ticker: string;
  name: string;
  composite_score: number;   // 0–100
  band: ScoreBand;           // green=60-100, yellow=35-59, red=0-34
  components: ScoreComponents;
  low_confidence: boolean;
  calculated_at: string;     // ISO 8601
}

// ---------------------------------------------------------------------------
// Risk Metrics
// ---------------------------------------------------------------------------

export interface TechnicalIndicators {
  rsi: number | null;
  macd_value: number | null;
  macd_signal: number | null;
  ema20: number | null;
  sma50: number | null;
}

export interface FundamentalData {
  pe_ratio: number | null;
  debt_equity: number | null;
  revenue_growth: number | null;
  interest_income_ratio: number | null;
  debt_market_cap_ratio: number | null;
}

export interface RiskMetrics {
  ticker: string;
  volatility_annual: number;
  var_95: number;          // positive number representing daily loss
  sharpe_ratio: number;
  beta: number;
  benchmark: string;       // e.g. "^TASI"
  technicals: TechnicalIndicators;
  fundamentals: FundamentalData;
  calculated_at: string;
}

// ---------------------------------------------------------------------------
// Halal Verdict
// ---------------------------------------------------------------------------

export type HalalStatus = "Halal" | "PurificationRequired" | "NonHalal" | "Unknown";
export type HalalSource = "Musaffa" | "AAOIFI";

export interface HalalVerdict {
  ticker: string;
  status: HalalStatus;
  source: HalalSource;
  /** Hardcoded disclaimer — const field. Always: "التحقق النهائي من الحلية يقع على عاتق المستخدم" */
  disclaimer: string;
  sector: string | null;
  debt_market_cap_ratio: number | null;
  interest_income_ratio: number | null;
  checked_at: string;
}

// ---------------------------------------------------------------------------
// News & Sentiment
// ---------------------------------------------------------------------------

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  published_at: string;
  snippet: string | null;
}

export interface NewsAnalysis {
  ticker: string;
  sentiment: SentimentLabel;
  summary_ar: string;
  summary_en: string;
  key_risks: string[];
  key_opportunities: string[];
  articles: NewsArticle[];
  fetched_at: string;
  news_unavailable: boolean;
}

// ---------------------------------------------------------------------------
// ARIMA Forecast
// ---------------------------------------------------------------------------

export interface ArimaForecast {
  ticker: string;
  forecast_dates: string[];
  forecast_values: number[];
  ci_lower: number[];
  ci_upper: number[];
  order: [number, number, number];   // (p, d, q)
  aic: number;
  sufficient_data: boolean;
  /** Hardcoded disclaimer — always: "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة" */
  disclaimer: string;
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Sector Comparison
// ---------------------------------------------------------------------------

export interface SectorStock {
  ticker: string;
  name: string;
  composite_score: number;
  band: ScoreBand;
}

export interface SectorComparison {
  sector: string;
  avg_score: number;
  stock_count: number;
  top_stocks: SectorStock[];
}

// ---------------------------------------------------------------------------
// Budget Allocator
// ---------------------------------------------------------------------------

export interface AllocationItem {
  ticker: string;
  name: string;
  shares: number;
  cost: number;
  weight: number;   // 0–1
}

export interface AllocationResult {
  budget: number;
  currency: string;
  allocations: AllocationItem[];
  total_invested: number;
  leftover: number;
  /** Hardcoded disclaimer — always: "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة" */
  disclaimer: string;
}
