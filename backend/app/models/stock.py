"""Pydantic models for Stock and InvestmentReadinessScore.

Weights are hardcoded constants (Principle V guard on T018):
    Volatility 0.25 | VaR 0.25 | Sharpe 0.20 | Beta 0.15 | Sentiment 0.15
"""

from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Score types
# ---------------------------------------------------------------------------

ScoreBand = Literal["green", "yellow", "red"]


class ScoreComponents(BaseModel):
    volatility_score: float = Field(ge=0, le=100)
    var_score: float = Field(ge=0, le=100)
    sharpe_score: float = Field(ge=0, le=100)
    beta_score: float = Field(ge=0, le=100)
    sentiment_score: float = Field(ge=0, le=100)


class InvestmentReadinessScore(BaseModel):
    ticker: str
    name: str
    composite_score: float = Field(ge=0, le=100)
    band: ScoreBand
    components: ScoreComponents
    low_confidence: bool
    calculated_at: str


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------


class SearchResult(BaseModel):
    ticker: str
    name: str
    exchange: str
    country: str
    type: str


# ---------------------------------------------------------------------------
# Risk / Technicals / Fundamentals
# ---------------------------------------------------------------------------


class TechnicalIndicators(BaseModel):
    rsi: Optional[float] = None
    macd_value: Optional[float] = None
    macd_signal: Optional[float] = None
    ema20: Optional[float] = None
    sma50: Optional[float] = None


class FundamentalData(BaseModel):
    pe_ratio: Optional[float] = None
    debt_equity: Optional[float] = None
    revenue_growth: Optional[float] = None
    interest_income_ratio: Optional[float] = None
    debt_market_cap_ratio: Optional[float] = None


class RiskMetrics(BaseModel):
    ticker: str
    volatility_annual: float
    var_95: float
    sharpe_ratio: float
    beta: float
    benchmark: str
    technicals: TechnicalIndicators
    fundamentals: FundamentalData
    calculated_at: str


# ---------------------------------------------------------------------------
# Halal
# ---------------------------------------------------------------------------

HalalStatus = Literal["Halal", "PurificationRequired", "NonHalal", "Unknown"]
HalalSource = Literal["Musaffa", "AAOIFI"]


class HalalVerdict(BaseModel):
    ticker: str
    status: HalalStatus
    source: HalalSource
    # Hardcoded disclaimer — must never be moved to i18n (Principle V)
    disclaimer: str = Field(
        default="التحقق النهائي من الحلية يقع على عاتق المستخدم",
        const=True,
    )
    sector: Optional[str] = None
    debt_market_cap_ratio: Optional[float] = None
    interest_income_ratio: Optional[float] = None
    checked_at: str


# ---------------------------------------------------------------------------
# News
# ---------------------------------------------------------------------------

SentimentLabel = Literal["positive", "neutral", "negative"]


class NewsArticle(BaseModel):
    title: str
    url: str
    source: str
    published_at: str
    snippet: Optional[str] = None


class NewsAnalysis(BaseModel):
    ticker: str
    sentiment: SentimentLabel
    summary_ar: str
    summary_en: str
    key_risks: list[str]
    key_opportunities: list[str]
    articles: list[NewsArticle]
    fetched_at: str
    news_unavailable: bool = False


# ---------------------------------------------------------------------------
# ARIMA
# ---------------------------------------------------------------------------


class ArimaForecast(BaseModel):
    ticker: str
    forecast_dates: list[str]
    forecast_values: list[float]
    ci_lower: list[float]
    ci_upper: list[float]
    order: tuple[int, int, int]
    aic: float
    sufficient_data: bool
    # Hardcoded disclaimer (Principle V)
    disclaimer: str = Field(
        default="هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة",
        const=True,
    )
    generated_at: str


# ---------------------------------------------------------------------------
# Sector
# ---------------------------------------------------------------------------


class SectorStock(BaseModel):
    ticker: str
    name: str
    composite_score: float
    band: ScoreBand


class SectorComparison(BaseModel):
    sector: str
    avg_score: float
    stock_count: int
    top_stocks: list[SectorStock]


# ---------------------------------------------------------------------------
# Allocator
# ---------------------------------------------------------------------------


class AllocationItem(BaseModel):
    ticker: str
    name: str
    shares: int
    cost: float
    weight: float = Field(ge=0, le=1)


class AllocationRequest(BaseModel):
    tickers: list[str] = Field(min_length=1, max_length=10)
    budget: float = Field(gt=0)


class AllocationResult(BaseModel):
    budget: float
    currency: str = "SAR"
    allocations: list[AllocationItem]
    total_invested: float
    leftover: float
    # Hardcoded disclaimer (Principle V)
    disclaimer: str = Field(
        default="تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة",
        const=True,
    )
