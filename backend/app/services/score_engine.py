"""Investment Readiness Score Engine.

WEIGHT GUARD — DO NOT CHANGE WEIGHTS WITHOUT UPDATING THIS COMMENT BLOCK.
Weights must sum to exactly 1.0:
    WEIGHT_VOLATILITY  = 0.25
    WEIGHT_VAR         = 0.25
    WEIGHT_SHARPE      = 0.20
    WEIGHT_BETA        = 0.15
    WEIGHT_SENTIMENT   = 0.15
    ─────────────────────────
    TOTAL              = 1.00

Normalisation formulas:
    volatility_score = max(0, 100 - (σ_annual / 0.60) × 100)
    var_score        = max(0, 100 - (VaR_95 / 0.05) × 100)
    sharpe_score     = min(100, max(0, (sharpe + 1) / 3 × 100))
    beta_score       = max(0, 100 - abs(β - 1) × 50)
    sentiment_score  = 80 if positive, 50 if neutral, 20 if negative

Bands:
    green  = 60–100
    yellow = 35–59
    red    = 0–34
"""

from __future__ import annotations

import datetime
import logging
from typing import Literal

import numpy as np

from app.models.stock import (
    InvestmentReadinessScore,
    ScoreBand,
    ScoreComponents,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants — SEE WEIGHT GUARD ABOVE BEFORE EDITING
# ---------------------------------------------------------------------------

WEIGHT_VOLATILITY: float = 0.25
WEIGHT_VAR: float = 0.25
WEIGHT_SHARPE: float = 0.20
WEIGHT_BETA: float = 0.15
WEIGHT_SENTIMENT: float = 0.15

assert (
    abs(WEIGHT_VOLATILITY + WEIGHT_VAR + WEIGHT_SHARPE + WEIGHT_BETA + WEIGHT_SENTIMENT - 1.0) < 1e-9
), "Score weights must sum to 1.0"

SentimentInput = Literal["positive", "neutral", "negative"]

# Minimum number of returns to produce a reliable score.
MIN_RETURNS = 30


# ---------------------------------------------------------------------------
# Normalisation helpers
# ---------------------------------------------------------------------------


def _normalise_volatility(sigma_annual: float) -> float:
    """score = max(0, 100 - (σ / 0.60) × 100)"""
    return max(0.0, 100.0 - (sigma_annual / 0.60) * 100.0)


def _normalise_var(var_95: float) -> float:
    """score = max(0, 100 - (VaR / 0.05) × 100).
    var_95 is a positive number representing the daily loss threshold.
    """
    return max(0.0, 100.0 - (var_95 / 0.05) * 100.0)


def _normalise_sharpe(sharpe: float) -> float:
    """score = min(100, max(0, (sharpe + 1) / 3 × 100))"""
    return min(100.0, max(0.0, (sharpe + 1.0) / 3.0 * 100.0))


def _normalise_beta(beta: float) -> float:
    """score = max(0, 100 - |β - 1| × 50)"""
    return max(0.0, 100.0 - abs(beta - 1.0) * 50.0)


def _normalise_sentiment(sentiment: SentimentInput) -> float:
    mapping: dict[str, float] = {"positive": 80.0, "neutral": 50.0, "negative": 20.0}
    return mapping.get(sentiment, 50.0)


def _band(score: float) -> ScoreBand:
    if score >= 60:
        return "green"
    if score >= 35:
        return "yellow"
    return "red"


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------


def compute_score(
    ticker: str,
    name: str,
    closes: list[float],
    sentiment: SentimentInput,
    benchmark_beta: float | None = None,
) -> InvestmentReadinessScore:
    """Compute InvestmentReadinessScore from price history + sentiment.

    Args:
        ticker: Upper-case ticker symbol.
        name:   Company display name.
        closes: Ordered daily closing prices (ascending, len ≥ 1).
        sentiment: News sentiment label.
        benchmark_beta: Pre-computed beta against MENA benchmark (or None).

    Returns:
        InvestmentReadinessScore with all fields populated.
    """
    prices = np.array(closes, dtype=float)
    # Mathematical sanity: filter out non-positive values to prevent invalid log calculations
    prices = prices[np.isfinite(prices) & (prices > 0)]
    low_confidence = len(prices) < MIN_RETURNS

    if len(prices) >= 2:
        log_returns = np.diff(np.log(prices))
    else:
        log_returns = np.array([])

    if len(log_returns) < 2:
        # Insufficient data to compute standard deviation and returns reliably.
        # Producing conservative (zero) scores to prevent incorrectly labeling a stock
        # as perfectly safe due to lack of historical data.
        sigma_annual = 0.0
        var_95 = 0.0
        sharpe = 0.0
        vol_score = 0.0
        var_score_val = 0.0
        sharpe_score = 0.0
        beta = benchmark_beta if benchmark_beta is not None else 1.0
        beta_score = 50.0  # Neutral
    else:
        # Annualised volatility (252 trading days)
        sigma_annual = float(np.std(log_returns, ddof=1) * np.sqrt(252))

        # 95% VaR (historical, parametric approximation using normal distribution)
        mu = float(np.mean(log_returns))
        sigma_daily = float(np.std(log_returns, ddof=1))
        # 1-day VaR at 95% confidence: μ - 1.645σ (as positive loss)
        var_95 = max(0.0, -(mu - 1.645 * sigma_daily))

        # Sharpe ratio (annualised, risk-free rate = 0 for simplicity)
        if sigma_annual > 0:
            sharpe = float((mu * 252) / sigma_annual)
        else:
            sharpe = 0.0

        # Beta
        beta = benchmark_beta if benchmark_beta is not None else 1.0

        # Component scores
        vol_score = _normalise_volatility(sigma_annual)
        var_score_val = _normalise_var(var_95)
        sharpe_score = _normalise_sharpe(sharpe)
        beta_score = _normalise_beta(beta)

    sentiment_score = _normalise_sentiment(sentiment)

    composite = (
        WEIGHT_VOLATILITY * vol_score
        + WEIGHT_VAR * var_score_val
        + WEIGHT_SHARPE * sharpe_score
        + WEIGHT_BETA * beta_score
        + WEIGHT_SENTIMENT * sentiment_score
    )
    composite = round(max(0.0, min(100.0, composite)), 2)

    logger.debug(
        "Score %s: composite=%.2f band=%s (vol=%.1f var=%.1f sharpe=%.1f beta=%.1f sent=%.1f) low_conf=%s",
        ticker, composite, _band(composite),
        vol_score, var_score_val, sharpe_score, beta_score, sentiment_score,
        low_confidence,
    )

    return InvestmentReadinessScore(
        ticker=ticker,
        name=name,
        composite_score=composite,
        band=_band(composite),
        components=ScoreComponents(
            volatility_score=round(vol_score, 2),
            var_score=round(var_score_val, 2),
            sharpe_score=round(sharpe_score, 2),
            beta_score=round(beta_score, 2),
            sentiment_score=round(sentiment_score, 2),
        ),
        low_confidence=low_confidence,
        calculated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
