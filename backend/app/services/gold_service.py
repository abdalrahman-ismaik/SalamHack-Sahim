"""Gold price service.

Fetches XAUUSD spot price from Twelve Data and converts to per-gram values
in USD, AED, and SAR. Falls back to static values when the API is unavailable.

The troy-ounce → gram conversion factor is 31.1035.
AED and SAR pegs are fixed (AED/USD = 3.6725, SAR/USD = 3.75).
"""

from __future__ import annotations

import datetime
import logging
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

# Fixed currency pegs
_AED_PER_USD = 3.6725
_SAR_PER_USD = 3.75
_TROY_OZ_TO_GRAM = 31.1035

# Static fallback — approximate price as of 2026-04-28
_STATIC_FALLBACK: dict[str, Any] = {
    "price_per_gram_usd": 96.50,
    "price_per_gram_aed": round(96.50 * _AED_PER_USD, 2),
    "price_per_gram_sar": round(96.50 * _SAR_PER_USD, 2),
    "source": "static",
    "date": "2026-04-28 (static)",
}


async def get_gold_price() -> dict[str, Any]:
    """Return gold price per gram in USD, AED, and SAR.

    Tries the Twelve Data ``/price`` endpoint for ``XAUUSD``.
    On any failure returns the static fallback so callers always
    get a usable response.
    """
    settings = get_settings()
    api_key = settings.twelve_data_api_key

    if not api_key:
        logger.warning("TWELVE_DATA_API_KEY not set — returning static gold price fallback")
        return _STATIC_FALLBACK

    today = datetime.date.today().isoformat()

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://api.twelvedata.com/price",
                params={"symbol": "XAU/USD", "apikey": api_key},
            )
            resp.raise_for_status()
            payload = resp.json()

            if "price" not in payload:
                raise ValueError(f"Unexpected Twelve Data response: {payload!r}")

            price_per_oz_usd: float = float(payload["price"])
            price_per_gram_usd = round(price_per_oz_usd / _TROY_OZ_TO_GRAM, 4)

            return {
                "price_per_gram_usd": price_per_gram_usd,
                "price_per_gram_aed": round(price_per_gram_usd * _AED_PER_USD, 4),
                "price_per_gram_sar": round(price_per_gram_usd * _SAR_PER_USD, 4),
                "source": "TwelveData",
                "date": today,
            }

    except Exception as exc:  # noqa: BLE001
        logger.warning("Gold price fetch failed (%s) — using static fallback", exc)
        return {**_STATIC_FALLBACK, "date": f"{today} (static)"}
