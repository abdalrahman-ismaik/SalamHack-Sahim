"""Risk metrics service: volatility, VaR, Sharpe, Beta (T029/T033).

MENA benchmark mapping:
    .SR  → ^TASI
    .CA  → ^EGX30
    .AE  → ^ADX
    others → ^GSPC
"""

from __future__ import annotations

import datetime
import logging
import math
from typing import Optional

import numpy as np

from app.models.stock import FundamentalData, RiskMetrics, TechnicalIndicators
from app.services import market_data
from app.exceptions import DataUnavailableError

logger = logging.getLogger(__name__)

# Benchmark ticker mapping by suffix
_BENCHMARK_MAP: dict[str, str] = {
    ".SR": "^TASI",
    ".CA": "^EGX30",
    ".AE": "^ADX",
}
_DEFAULT_BENCHMARK = "^GSPC"


def _resolve_benchmark(ticker: str) -> str:
    for suffix, bench in _BENCHMARK_MAP.items():
        if ticker.upper().endswith(suffix):
            return bench
    return _DEFAULT_BENCHMARK


def _compute_beta(stock_returns: np.ndarray, bench_returns: np.ndarray) -> float:
    """Compute OLS beta: Cov(r_s, r_b) / Var(r_b)."""
    min_len = min(len(stock_returns), len(bench_returns))
    if min_len < 2:
        return 1.0
    s = stock_returns[-min_len:]
    b = bench_returns[-min_len:]
    var_b = float(np.var(b, ddof=1))
    if var_b == 0:
        return 1.0
    cov = float(np.cov(s, b)[0, 1])
    return round(cov / var_b, 4)


async def compute_risk_metrics(ticker: str) -> RiskMetrics:
    """Compute full risk panel for a ticker."""
    benchmark = _resolve_benchmark(ticker)
    logger.info("Computing risk for %s (benchmark=%s)", ticker, benchmark)

    # Fetch stock OHLCV
    ohlcv = await market_data.get_ohlcv(ticker, days=365)
    closes = np.array(ohlcv["closes"], dtype=float)

    if len(closes) < 2:
        raise DataUnavailableError(ticker, "insufficient price data for risk calc")
    logger.debug("%s: %d closes loaded, last=%.4f", ticker, len(closes), closes[-1])

    log_returns = np.diff(np.log(closes))

    # Annualised volatility
    sigma_annual = float(np.std(log_returns, ddof=1) * math.sqrt(252))

    # 95% VaR (parametric)
    mu_daily = float(np.mean(log_returns))
    sigma_daily = float(np.std(log_returns, ddof=1))
    var_95 = max(0.0, -(mu_daily - 1.645 * sigma_daily))

    # Sharpe (annualised, rf=0)
    sharpe = (mu_daily * 252) / sigma_annual if sigma_annual > 0 else 0.0

    # Beta via benchmark
    beta = 1.0
    try:
        bench_ohlcv = await market_data.get_ohlcv(benchmark, days=365)
        bench_closes = np.array(bench_ohlcv["closes"], dtype=float)
        if len(bench_closes) >= 2:
            bench_returns = np.diff(np.log(bench_closes))
            beta = _compute_beta(log_returns, bench_returns)
    except DataUnavailableError:
        logger.warning("Benchmark data unavailable for %s, using beta=1.0", ticker)

    # Technicals
    try:
        tech_raw = await market_data.get_technicals(ticker)
        technicals = TechnicalIndicators(**tech_raw)
    except Exception:
        technicals = TechnicalIndicators()

    # Fundamentals
    try:
        fund_raw = await market_data.get_fundamentals(ticker)
        fundamentals = FundamentalData(**fund_raw)
    except Exception:
        fundamentals = FundamentalData()

    logger.info(
        "Risk result for %s: vol=%.4f VaR=%.4f sharpe=%.4f beta=%.4f",
        ticker, round(sigma_annual, 4), round(var_95, 4), round(sharpe, 4), round(beta, 4),
    )
    return RiskMetrics(
        ticker=ticker,
        volatility_annual=round(sigma_annual, 4),
        var_95=round(var_95, 4),
        sharpe_ratio=round(sharpe, 4),
        beta=round(beta, 4),
        benchmark=benchmark,
        technicals=technicals,
        fundamentals=fundamentals,
        calculated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
