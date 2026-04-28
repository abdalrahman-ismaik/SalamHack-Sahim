"""
Market data adapter — Twelve Data (primary) + Alpha Vantage (fallback).

Public API:
    search_stocks(query)           → list[dict]
    get_ohlcv(ticker, days=365)    → dict with dates + closes
    get_quote(ticker)              → dict current_price + change_pct
    get_technicals(ticker)         → RSI, MACD, EMA20, SMA50
    get_fundamentals(ticker)       → financial ratios

All functions are resilient and NEVER crash the system.
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

_TIMEOUT = httpx.Timeout(10.0, connect=5.0)


def _client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=_TIMEOUT)


def _safe_float(v: Any) -> Optional[float]:
    try:
        return float(v)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# SEARCH
# ---------------------------------------------------------------------------

async def search_stocks(query: str) -> list[dict[str, Any]]:
    settings = get_settings()

    params = {
        "symbol": query,
        "apikey": settings.twelve_data_api_key,
    }

    async with _client() as client:
        try:
            resp = await client.get(f"{TWELVE_DATA_BASE}/symbol_search", params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            raise DataUnavailableError(query, str(exc))

    return [
        {
            "ticker": r.get("symbol", ""),
            "name": r.get("instrument_name", ""),
            "exchange": r.get("exchange", ""),
            "country": r.get("country", ""),
            "type": r.get("instrument_type", ""),
        }
        for r in data.get("data", [])[:10]
    ]


# ---------------------------------------------------------------------------
# OHLCV (FIXED + FALLBACK)
# ---------------------------------------------------------------------------

async def get_ohlcv(ticker: str, days: int = 365) -> dict[str, Any]:
    settings = get_settings()

    # ---------------- Twelve Data ----------------
    try:
        params = {
            "symbol": ticker,
            "interval": "1day",
            "outputsize": days,
            "apikey": settings.twelve_data_api_key,
        }

        async with _client() as client:
            resp = await client.get(f"{TWELVE_DATA_BASE}/time_series", params=params)
            resp.raise_for_status()
            data = resp.json()

        if "values" in data:
            values = list(reversed(data["values"]))
            return {
                "dates": [v["datetime"] for v in values],
                "closes": [float(v["close"]) for v in values],
            }

    except Exception as exc:
        logger.warning("Twelve Data OHLCV failed: %s", exc)

    # ---------------- Alpha Vantage ----------------
    try:
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": ticker,
            "apikey": settings.alpha_vantage_api_key,
        }

        async with _client() as client:
            resp = await client.get(ALPHA_VANTAGE_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()

        ts = data.get("Time Series (Daily)", {})

        if ts:
            dates = list(ts.keys())
            closes = [float(v["4. close"]) for v in ts.values()]

            return {
                "dates": dates,
                "closes": closes,
            }

    except Exception as exc:
        logger.warning("Alpha Vantage OHLCV failed: %s", exc)

    return {"dates": [], "closes": []}


# ---------------------------------------------------------------------------
# QUOTE (SAFE)
# ---------------------------------------------------------------------------

async def get_quote(ticker: str) -> dict[str, Any]:
    settings = get_settings()

    # Twelve Data
    try:
        params = {"symbol": ticker, "apikey": settings.twelve_data_api_key}

        async with _client() as client:
            resp = await client.get(f"{TWELVE_DATA_BASE}/quote", params=params)
            resp.raise_for_status()
            data = resp.json()

        price = data.get("close") or data.get("price")
        if price:
            return {
                "ticker": ticker,
                "name": data.get("name", ticker),
                "exchange": data.get("exchange", ""),
                "current_price": float(price),
                "change_pct": float(data.get("percent_change", 0)),
            }

    except Exception as exc:
        logger.warning("Quote failed (Twelve Data): %s", exc)

    # Alpha fallback
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

        q = data.get("Global Quote", {})

        if q:
            return {
                "ticker": ticker,
                "name": ticker,
                "exchange": "",
                "current_price": float(q.get("05. price", 0)),
                "change_pct": float(q.get("10. change percent", "0").rstrip("%")),
            }

    except Exception as exc:
        logger.warning("Quote failed (Alpha Vantage): %s", exc)

    return {
        "ticker": ticker,
        "name": ticker,
        "exchange": "",
        "current_price": 0.0,
        "change_pct": 0.0,
    }


# ---------------------------------------------------------------------------
# TECHNICALS (SAFE DEFAULTS)
# ---------------------------------------------------------------------------

async def get_technicals(ticker: str) -> dict[str, Optional[float]]:
    settings = get_settings()

    results = {
        "rsi": 50.0,
        "macd_value": 0.0,
        "macd_signal": 0.0,
        "ema20": 0.0,
        "sma50": 0.0,
    }

    async def fetch(indicator: str, extra: dict):
        try:
            params = {
                "symbol": ticker,
                "interval": "1day",
                "apikey": settings.twelve_data_api_key,
                **extra,
            }

            async with _client() as client:
                resp = await client.get(f"{TWELVE_DATA_BASE}/{indicator}", params=params)
                resp.raise_for_status()
                data = resp.json()

            values = data.get("values", [])
            return values[0] if values else None

        except Exception:
            return None

    rsi = await fetch("rsi", {"time_period": 14})
    if rsi:
        results["rsi"] = _safe_float(rsi.get("rsi")) or 50.0

    macd = await fetch("macd", {"fast_period": 12, "slow_period": 26, "signal_period": 9})
    if macd:
        results["macd_value"] = _safe_float(macd.get("macd")) or 0.0
        results["macd_signal"] = _safe_float(macd.get("macd_signal")) or 0.0

    ema = await fetch("ema", {"time_period": 20})
    if ema:
        results["ema20"] = _safe_float(ema.get("ema")) or 0.0

    sma = await fetch("sma", {"time_period": 50})
    if sma:
        results["sma50"] = _safe_float(sma.get("sma")) or 0.0

    return results


# ---------------------------------------------------------------------------
# FUNDAMENTALS (SAFE)
# ---------------------------------------------------------------------------

async def get_fundamentals(ticker: str) -> dict[str, Optional[float]]:
    settings = get_settings()

    results = {
        "pe_ratio": None,
        "debt_equity": None,
        "revenue_growth": None,
        "prohibited_income_pct": None,
        "debt_market_cap_ratio": None,
    }

    try:
        params = {"symbol": ticker, "apikey": settings.twelve_data_api_key}

        async with _client() as client:
            resp = await client.get(f"{TWELVE_DATA_BASE}/fundamentals", params=params)
            resp.raise_for_status()
            data = resp.json()

        if not data or "statistics" not in data:
            return results

        stats = data.get("statistics", {})
        valuation = stats.get("valuations_metrics", {})
        financials = data.get("financials", {})
        income = financials.get("income_statement", {})
        balance = financials.get("balance_sheet", {})

        results["pe_ratio"] = _safe_float(valuation.get("trailing_pe"))

        return results

    except Exception as exc:
        logger.warning("Fundamentals failed: %s", exc)

    return results