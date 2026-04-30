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
  current_price: number | null;
  change_pct: number | null;
  volatility_annual: number;
  var_95: number;          // positive number representing daily loss
  sharpe_ratio: number;
  beta: number;
  max_drawdown: number | null;
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

// ---------------------------------------------------------------------------
// SaaS / Auth
// ---------------------------------------------------------------------------

export type UserTier = 'guest' | 'free' | 'pro' | 'enterprise';

export interface UserSession {
  id:     string | null;
  name:   string | null;
  photoURL: string | null;
  locale: 'ar' | 'en';
  tier:   UserTier;
}

export const GUEST_SESSION: UserSession = {
  id:     null,
  name:   null,
  photoURL: null,
  locale: 'ar',
  tier:   'guest',
};

// ---------------------------------------------------------------------------
// Dashboard KPI
// ---------------------------------------------------------------------------

export interface DashboardKPI {
  watchlistCount: number;
  halalComplianceRate: number | null; // 0–100 percentage, or null when watchlist is empty
  riskProfile: string | null;          // e.g., "Conservative", "Moderate", "Aggressive", or null
  lastZakatDate: string | null;        // ISO 8601, or null if never calculated
  lastViewedTicker: string | null;     // e.g., "AAPL", or null if no history
}

// ---------------------------------------------------------------------------
// Dashboard Chart Data
// ---------------------------------------------------------------------------

export interface ArimaChartPoint {
  date: string;                        // ISO 8601 date
  price: number;
  ci_lower: number;
  ci_upper: number;
}

export interface SectorBar {
  sector: string;                      // Arabic sector name
  value: number;                       // % change or allocation weight
  positive: boolean;                   // for color coding
}

export interface RiskGaugeData {
  score: number | null;                // 0–100, or null if not calculated
  label: string;                       // "Low", "Moderate", "High"
}

// ---------------------------------------------------------------------------
// Dashboard News
// ---------------------------------------------------------------------------

export interface DashboardNewsItem {
  ticker: string;
  headline: string;                    // Arabic headline
  source: string;
  timestamp: string;                   // ISO 8601
  url: string;
  halalStatus: HalalStatus;            // from ticker's Halal verdict
}

// ---------------------------------------------------------------------------
// Dashboard Service Card
// ---------------------------------------------------------------------------

export interface ServiceCard {
  id: string;
  titleAr?: string;                    // Added in T005
  descriptionAr?: string;              // Added in T005
  icon: string;                        // icon name or path
  requiredTier: UserTier;              // 'free', 'pro', 'enterprise'
  href: string;                        // route path
  available?: boolean;                 // optional compat field
}

// ---------------------------------------------------------------------------
// Dashboard Support Chat
// ---------------------------------------------------------------------------

export interface SupportChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SupportChatRequest {
  message: string;
  locale: 'ar' | 'en' | string;
  history?: SupportChatMessage[];
}

export interface SupportChatResponse {
  reply: string;
  source: 'gemini' | 'fallback';
}

// ---------------------------------------------------------------------------
// Pricing Plans (static)
// ---------------------------------------------------------------------------

export type PlanId = 'free' | 'pro' | 'enterprise';

export interface PricingPlan {
  readonly id:           PlanId;
  readonly tier:         0 | 1 | 2;
  readonly monthlyPrice: number | null;
  readonly highlighted:  boolean;
  readonly ctaVariant:   'default' | 'outline';
}



// ---------------------------------------------------------------------------
// Halal Investor Tools (Feature 003)
// ---------------------------------------------------------------------------

export type RiskLabel = 'conservative' | 'moderate' | 'aggressive';

export interface RiskProfile {
  user_id:      string | null;
  score:        number;              // 0–100 weighted sum
  label:        RiskLabel;
  answers:      Record<string, number>; // q1–q6 answer indices
  completed_at: string;              // ISO 8601
}

export interface GoldPriceData {
  price_per_gram_usd: number;
  price_per_gram_aed: number;
  price_per_gram_sar: number;
  source:             'TwelveData' | 'static';
  date:               string;        // ISO 8601 date string
}

export interface ZakatResult {
  net_value:       number;
  nisab_value:     number;
  nisab_source:    'api' | 'static';
  gold_price_date: string;
  zakat_due:       number | null;    // null when below nisab
  below_nisab:     boolean;
  currency:        'AED' | 'USD' | 'SAR';
}

export interface ComplianceAlertPreference {
  enabled:           boolean;
  last_known_status: HalalStatus;
  updated_at:        string;         // ISO 8601
}

export interface ComplianceChangeNotification {
  ticker:          string;
  previous_status: HalalStatus;
  current_status:  HalalStatus;
  detected_at:     string;           // ISO 8601
}
