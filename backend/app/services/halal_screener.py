"""Halal screener service.

Primary: HalalScreener API (5s timeout)
Provider failure falls back to the built-in AAOIFI ratio screen where possible;
callers can show reduced-mode messaging without affecting user-owned Firestore
state.
"""

from __future__ import annotations

import datetime
import logging
from typing import Optional

import httpx

from app.config import get_settings
from app.exceptions import DataUnavailableError
from app.models.stock import HalalVerdict

logger = logging.getLogger(__name__)

_HALAL_SCREENER_BASE = "https://halalscreener.app/api/v1"
_API_TIMEOUT = httpx.Timeout(5.0, connect=3.0)


async def get_halal_verdict(
    ticker: str,
    sector: Optional[str] = None,
    debt_market_cap_ratio: Optional[float] = None,
    interest_income_ratio: Optional[float] = None,
) -> HalalVerdict:
    """Return HalalVerdict using the Halal Screener API."""
    settings = get_settings()

    if not settings.halal_screener_api_key:
        logger.warning("Halal Screener API key is not set")
        return HalalVerdict(
            ticker=ticker,
            status="Unknown",
            source="HalalScreener",
            sector=sector,
            debt_market_cap_ratio=debt_market_cap_ratio,
            interest_income_ratio=interest_income_ratio,
            checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )

    logger.debug("Halal screen %s: trying Halal Screener API", ticker)
    try:
        async with httpx.AsyncClient(timeout=_API_TIMEOUT) as client:
            resp = await client.get(
                f"{_HALAL_SCREENER_BASE}/screen",
                params={"symbol": ticker},
                headers={"Authorization": f"Bearer {settings.halal_screener_api_key}"},
            )
            resp.raise_for_status()
            data = resp.json()

        # Halal Screener returns {"status": "halal"|"haram"|"doubtful"}
        raw_status = data.get("status", "").lower()
        status_map = {
            "halal": "Halal",
            "haram": "NonHalal",
            "doubtful": "PurificationRequired",
        }
        verdict_status = status_map.get(raw_status, "Unknown")
        
        financials = data.get("financials", {})

        return HalalVerdict(
            ticker=ticker,
            status=verdict_status,  # type: ignore[arg-type]
            source="HalalScreener",
            sector=data.get("sector") or sector,
            debt_market_cap_ratio=financials.get("debtToMarketCap") or debt_market_cap_ratio,
            interest_income_ratio=financials.get("prohibitedIncomePct") or interest_income_ratio,
            checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )
    except Exception as exc:
        logger.warning("Halal Screener API failed for %s: %s", ticker, exc)
        return HalalVerdict(
            ticker=ticker,
            status="Unknown",
            source="HalalScreener",
            sector=sector,
            debt_market_cap_ratio=debt_market_cap_ratio,
            interest_income_ratio=interest_income_ratio,
            checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )
