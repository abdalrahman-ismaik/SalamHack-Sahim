"""ARIMA forecast service using statsmodels.

Grid search: p∈{0,1,2}, d∈{0,1}, q∈{0,1,2} by AIC.
30-day forecast with 95% CI.
Requires ≥252 trading days of closes.
Input: log-differenced prices.

Disclaimer const: "هذا تقدير إحصائي مستقل، وليس نصيحة استثمارية مرخصة"
"""

from __future__ import annotations

import datetime
import itertools
import logging
import math
import warnings
from typing import Optional

import numpy as np

from app.exceptions import DataUnavailableError
from app.models.stock import ArimaForecast
from app.services import market_data

logger = logging.getLogger(__name__)

_MIN_HISTORY = 252  # trading days
_FORECAST_DAYS = 30
_CI_ALPHA = 0.05  # 95% confidence interval

# Grid search space
_P_RANGE = [0, 1, 2]
_D_RANGE = [0, 1]
_Q_RANGE = [0, 1, 2]


def _best_arima(log_returns: np.ndarray) -> tuple:
    """Return (order, model_fit) with lowest AIC via grid search."""
    # Suppress convergence warnings during grid search
    import statsmodels.tsa.arima.model as arima_mod

    best_aic = float("inf")
    best_fit = None
    best_order = (1, 0, 1)

    for p, d, q in itertools.product(_P_RANGE, _D_RANGE, _Q_RANGE):
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                mdl = arima_mod.ARIMA(log_returns, order=(p, d, q))
                fit = mdl.fit(method_kwargs={"warn_convergence": False})
                if fit.aic < best_aic:
                    best_aic = fit.aic
                    best_fit = fit
                    best_order = (p, d, q)
        except Exception:
            continue

    if best_fit is None:
        raise ValueError("All ARIMA orders failed to converge")

    return best_order, best_fit


async def compute_arima_forecast(ticker: str) -> ArimaForecast:
    """Return 30-day price forecast with 95% CI."""
    ohlcv = await market_data.get_ohlcv(ticker, days=400)
    closes = np.array(ohlcv["closes"], dtype=float)

    if len(closes) < _MIN_HISTORY:
        raise DataUnavailableError(
            ticker, f"يلزم ≥{_MIN_HISTORY} يوم تداول للتنبؤ بـ ARIMA (متوفر: {len(closes)})"
        )

    # Log-difference (log returns)
    log_returns = np.diff(np.log(closes))

    try:
        order, fit = _best_arima(log_returns)
    except ValueError as exc:
        raise DataUnavailableError(ticker, str(exc)) from exc

    # Forecast _FORECAST_DAYS steps ahead in log-return space
    try:
        fc = fit.get_forecast(steps=_FORECAST_DAYS)
        fc_mean = fc.predicted_mean
        fc_ci = fc.conf_int(alpha=_CI_ALPHA)
    except Exception as exc:
        raise DataUnavailableError(ticker, f"ARIMA forecast failed: {exc}") from exc

    # Reconstruct price levels from last known close
    last_price = float(closes[-1])
    forecast_prices: list[float] = []
    ci_lower: list[float] = []
    ci_upper: list[float] = []

    cumulative_log = 0.0
    for i in range(_FORECAST_DAYS):
        cumulative_log += float(fc_mean.iloc[i])
        forecast_prices.append(round(last_price * math.exp(cumulative_log), 4))

        # CI: reconstruct from lower/upper log-returns cumsum
        cum_lo = sum(float(fc_ci.iloc[j, 0]) for j in range(i + 1))
        cum_hi = sum(float(fc_ci.iloc[j, 1]) for j in range(i + 1))
        ci_lower.append(round(last_price * math.exp(cum_lo), 4))
        ci_upper.append(round(last_price * math.exp(cum_hi), 4))

    # Generate date labels (business days)
    base_date = datetime.date.today()
    dates = []
    d = base_date
    while len(dates) < _FORECAST_DAYS:
        d += datetime.timedelta(days=1)
        if d.weekday() < 5:  # Mon–Fri
            dates.append(d.isoformat())

    return ArimaForecast(
        ticker=ticker,
        order=list(order),
        aic=round(float(fit.aic), 2),
        forecast_prices=forecast_prices,
        ci_lower=ci_lower,
        ci_upper=ci_upper,
        dates=dates,
        last_price=round(last_price, 4),
        calculated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
