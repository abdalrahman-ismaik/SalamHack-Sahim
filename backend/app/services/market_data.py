"""Market data adapter — Twelve Data (primary) + Alpha Vantage (quote fallback).

Public API:
    search_stocks(query)           → list[dict]  (T019)
    get_ohlcv(ticker, days=365)    → dict with 'dates' and 'closes' lists
    get_quote(ticker)              → dict with current_price, change_pct
    get_technicals(ticker)         → dict with rsi, macd_value, macd_signal, ema20, sma50  (T029)
    get_fundamentals(ticker)       → dict with pe_ratio, debt_equity, revenue_growth,
                                            interest_income_ratio, debt_market_cap_ratio  (T029)

All functions raise DataUnavailableError on total failure.
Individual fields may be None when partially unavailable.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.config import get_settings
from app.exceptions import DataUnavailableError

logger = logging.getLogger(__name__)

TWELVE_DATA_BASE = "https://api.twelvedata.com"
ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"

# HTTP timeouts (seconds)
_TIMEOUT = httpx.Timeout(10.0, connect=5.0)


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=_TIMEOUT)


# ---------------------------------------------------------------------------
# Stock search (T019)
# ---------------------------------------------------------------------------


async def search_stocks(query: str) -> list[dict[str, Any]]:
    """Search stocks by ticker or company name via Twelve Data /symbol_search."""
    settings = get_settings()
    params = {
        "symbol": query,
        "apikey": settings.twelve_data_api_key,
        "outputsize": 10,
        "show_plan": False,
    }
    async with _client() as client:
        try:
            resp = await client.get(f"{TWELVE_DATA_BASE}/symbol_search", params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            raise DataUnavailableError(query, f"search failed: {exc}") from exc

    results = data.get("data", [])
    logger.debug("search_stocks %r → %d raw results", query, len(results))
    return [
        {
            "ticker": r.get("symbol", ""),
            "name": r.get("instrument_name", ""),
            "exchange": r.get("exchange", ""),
            "country": r.get("country", ""),
            "type": r.get("instrument_type", ""),
        }
        for r in results[:10]
    ]


# ---------------------------------------------------------------------------
# OHLCV time series
# ---------------------------------------------------------------------------


async def get_ohlcv(ticker: str, days: int = 365) -> dict[str, Any]:
    """Fetch daily OHLCV via Twelve Data /time_series.

    Returns:
        {
            "dates":  list[str],    # YYYY-MM-DD ascending
            "opens":  list[float],
            "highs":  list[float],
            "lows":   list[float],
            "closes": list[float],
            "volumes": list[int],
        }
    """
    logger.debug("get_ohlcv %s days=%d", ticker, days)
    settings = get_settings()
    params = {
        "symbol": ticker,
        "interval": "1day",
        "outputsize": days,
        "apikey": settings.twelve_data_api_key,
        "format": "JSON",
    }
    async with _client() as client:
        try:
            resp = await client.get(f"{TWELVE_DATA_BASE}/time_series", params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            raise DataUnavailableError(ticker, f"OHLCV fetch failed: {exc}") from exc

    if "values" not in data:
        raise DataUnavailableError(ticker, data.get("message", "no values"))

    values: list[dict] = list(reversed(data["values"]))  # ascending order
    logger.debug("get_ohlcv %s → %d candles", ticker, len(values))
    return {
        "dates": [v["datetime"] for v in values],
        "opens": [float(v["open"]) for v in values],
        "highs": [float(v["high"]) for v in values],
        "lows": [float(v["low"]) for v in values],
        "closes": [float(v["close"]) for v in values],
        "volumes": [int(v.get("volume", 0)) for v in values],
    }


# ---------------------------------------------------------------------------
# Real-time quote
# ---------------------------------------------------------------------------


async def get_quote(ticker: str) -> dict[str, Any]:
    """Fetch current quote. Falls back to Alpha Vantage on Twelve Data failure."""
    settings = get_settings()

    # --- Twelve Data ---
    try:
        params = {"symbol": ticker, "apikey": settings.twelve_data_api_key}
        async with _client() as client:
            resp = await client.get(f"{TWELVE_DATA_BASE}/quote", params=params)
            resp.raise_for_status()
            data = resp.json()
        if "close" in data or "price" in data:
            price = float(data.get("close") or data.get("price", 0))
            change_pct = float(data.get("percent_change", 0))
            name = data.get("name", ticker)
            exchange = data.get("exchange", "")
            return {
                "ticker": ticker,
                "name": name,
                "exchange": exchange,
                "current_price": price,
                "change_pct": change_pct,
            }
    except Exception as exc:
        logger.warning("Twelve Data quote failed for %s: %s", ticker, exc)

    # --- Alpha Vantage fallback ---
    try:
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": ticker,
            "apikey": settings.alpha_vantage_api_key,
        }
        async with _client() as client:
            resp = await client.get(ALPHA_VANTAGE_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()
        quote = data.get("Global Quote", {})
        if quote:
            return {
                "ticker": ticker,
                "name": ticker,
                "exchange": "",
                "current_price": float(quote.get("05. price", 0)),
                "change_pct": float(
                    quote.get("10. change percent", "0").rstrip("%") or 0
                ),
            }
    except Exception as exc:
        logger.warning("Alpha Vantage quote failed for %s: %s", ticker, exc)

    raise DataUnavailableError(ticker, "quote unavailable from all sources")


# ---------------------------------------------------------------------------
# Technical indicators (T029)
# ---------------------------------------------------------------------------


async def get_technicals(ticker: str) -> dict[str, Optional[float]]:
    """Fetch RSI(14), MACD, EMA20, SMA50 from Twelve Data."""
    settings = get_settings()
    results: dict[str, Optional[float]] = {
        "rsi": None,
        "macd_value": None,
        "macd_signal": None,
        "ema20": None,
        "sma50": None,
    }

    async def _fetch_indicator(indicator: str, params_extra: dict) -> Optional[dict]:
        params = {
            "symbol": ticker,
            "interval": "1day",
            "apikey": settings.twelve_data_api_key,
            "outputsize": 1,
            **params_extra,
        }
        try:
            async with _client() as client:
                resp = await client.get(
                    f"{TWELVE_DATA_BASE}/{indicator}", params=params
                )
                resp.raise_for_status()
                data = resp.json()
            values = data.get("values", [])
            return values[0] if values else None
        except Exception as exc:
            logger.warning("%s fetch failed for %s: %s", indicator, ticker, exc)
            return None

    rsi_data = await _fetch_indicator("rsi", {"time_period": 14})
    if rsi_data:
        results["rsi"] = _safe_float(rsi_data.get("rsi"))

    macd_data = await _fetch_indicator(
        "macd", {"fast_period": 12, "slow_period": 26, "signal_period": 9}
    )
    if macd_data:
        results["macd_value"] = _safe_float(macd_data.get("macd"))
        results["macd_signal"] = _safe_float(macd_data.get("macd_signal"))

    ema_data = await _fetch_indicator("ema", {"time_period": 20})
    if ema_data:
        results["ema20"] = _safe_float(ema_data.get("ema"))

    sma_data = await _fetch_indicator("sma", {"time_period": 50})
    if sma_data:
        results["sma50"] = _safe_float(sma_data.get("sma"))

    return results


# ---------------------------------------------------------------------------
# Fundamental data (T029)
# ---------------------------------------------------------------------------


async def get_fundamentals(ticker: str) -> dict[str, Optional[float]]:
    """Fetch P/E, D/E, revenue_growth, interest_income_ratio, debt_market_cap_ratio."""
    logger.debug("get_fundamentals %s", ticker)
    settings = get_settings()
    results: dict[str, Optional[float]] = {
        "pe_ratio": None,
        "debt_equity": None,
        "revenue_growth": None,
        "interest_income_ratio": None,
        "debt_market_cap_ratio": None,
    }
    try:
        params = {
            "symbol": ticker,
            "apikey": settings.twelve_data_api_key,
        }
        async with _client() as client:
            resp = await client.get(
                f"{TWELVE_DATA_BASE}/fundamentals", params=params
            )
            resp.raise_for_status()
            data = resp.json()

        stats = data.get("statistics", {})
        valuation = stats.get("valuations_metrics", {})
        financials = data.get("financials", {})
        income = financials.get("income_statement", {})
        balance = financials.get("balance_sheet", {})

        results["pe_ratio"] = _safe_float(
            valuation.get("trailing_pe") or valuation.get("forward_pe")
        )
        results["debt_equity"] = _safe_float(
            stats.get("financial_health", {}).get("total_debt_to_equity")
        )

        # Revenue growth: YoY from last two annual revenues
        revenues = income.get("annual", {}).get("total_revenue", [])
        if len(revenues) >= 2 and revenues[-1] and revenues[-2]:
            r_curr = float(revenues[-1])
            r_prev = float(revenues[-2])
            if r_prev != 0:
                results["revenue_growth"] = round((r_curr - r_prev) / abs(r_prev), 4)

        # Interest income ratio for Halal screening
        interest = _safe_float(
            income.get("annual", {}).get("interest_income", [None])[-1]
            if income.get("annual", {}).get("interest_income")
            else None
        )
        revenue = _safe_float(
            revenues[-1] if revenues else None
        )
        if interest is not None and revenue and revenue != 0:
            results["interest_income_ratio"] = round(abs(interest) / abs(revenue), 4)

        # Debt / Market Cap
        total_debt = _safe_float(
            balance.get("annual", {}).get("total_debt", [None])[-1]
            if balance.get("annual", {}).get("total_debt")
            else None
        )
        market_cap = _safe_float(stats.get("valuations_metrics", {}).get("market_cap"))
        if total_debt is not None and market_cap and market_cap != 0:
            results["debt_market_cap_ratio"] = round(
                abs(total_debt) / abs(market_cap), 4
            )

    except Exception as exc:
        logger.warning("Fundamentals fetch failed for %s: %s", ticker, exc)

    return results


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


def _safe_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
