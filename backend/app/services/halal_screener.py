"""Halal screener service.

Primary: Musaffa API (5s timeout)
Fallback: AAOIFI rules (built-in)

AAOIFI fallback logic:
1. Sector pre-filter: banking / alcohol / gambling / tobacco / weapons → NonHalal  (T038)
2. If debt/market_cap < 0.33 AND interest/revenue < 0.05 → Halal
3. If (0.33 ≤ debt/market_cap ≤ 0.50) OR (0.05 ≤ interest/revenue ≤ 0.10) → PurificationRequired
4. Otherwise → NonHalal

Disclaimer field is hardcoded (Principle V): "التحقق النهائي من الحلية يقع على عاتق المستخدم"
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

_MUSAFFA_BASE = "https://api.musaffa.com/v1"
_MUSAFFA_TIMEOUT = httpx.Timeout(5.0, connect=3.0)

# Sectors always classified NonHalal (T038 sector pre-filter)
_NON_HALAL_SECTORS: frozenset[str] = frozenset(
    [
        "banking",
        "bank",
        "financial services",
        "alcohol",
        "beverages—alcoholic",
        "gambling",
        "casino",
        "tobacco",
        "weapons",
        "defense",
        "arms",
    ]
)


def _sector_non_halal(sector: Optional[str]) -> bool:
    if not sector:
        return False
    return sector.lower().strip() in _NON_HALAL_SECTORS


def _aaoifi_classify(
    sector: Optional[str],
    debt_market_cap_ratio: Optional[float],
    interest_income_ratio: Optional[float],
) -> str:
    """Apply AAOIFI fallback rules."""
    # Sector pre-filter (T038)
    if _sector_non_halal(sector):
        return "NonHalal"

    d = debt_market_cap_ratio
    i = interest_income_ratio

    # If both ratios available apply thresholds
    if d is not None and i is not None:
        if d < 0.33 and i < 0.05:
            return "Halal"
        if (0.33 <= d <= 0.50) or (0.05 <= i <= 0.10):
            return "PurificationRequired"
        return "NonHalal"

    # Only one ratio available
    if d is not None:
        if d < 0.33:
            return "Halal"
        if d <= 0.50:
            return "PurificationRequired"
        return "NonHalal"

    if i is not None:
        if i < 0.05:
            return "Halal"
        if i <= 0.10:
            return "PurificationRequired"
        return "NonHalal"

    # No financial data — sector only
    if sector and not _sector_non_halal(sector):
        return "Unknown"
    return "Unknown"


async def get_halal_verdict(
    ticker: str,
    sector: Optional[str] = None,
    debt_market_cap_ratio: Optional[float] = None,
    interest_income_ratio: Optional[float] = None,
) -> HalalVerdict:
    """Return HalalVerdict. Tries Musaffa first, falls back to AAOIFI."""
    settings = get_settings()

    # --- Musaffa (primary) ---
    if settings.musaffa_api_key:
        logger.debug("Halal screen %s: trying Musaffa API", ticker)
        try:
            async with httpx.AsyncClient(timeout=_MUSAFFA_TIMEOUT) as client:
                resp = await client.get(
                    f"{_MUSAFFA_BASE}/stocks/{ticker}/compliance",
                    headers={"Authorization": f"Bearer {settings.musaffa_api_key}"},
                )
                resp.raise_for_status()
                data = resp.json()

            # Musaffa returns {"compliant_status": "COMPLIANT"|"NON_COMPLIANT"|"QUESTIONABLE"}
            raw_status = data.get("compliant_status", "").upper()
            status_map = {
                "COMPLIANT": "Halal",
                "NON_COMPLIANT": "NonHalal",
                "QUESTIONABLE": "PurificationRequired",
            }
            verdict_status = status_map.get(raw_status, "Unknown")

            return HalalVerdict(
                ticker=ticker,
                status=verdict_status,  # type: ignore[arg-type]
                source="Musaffa",
                sector=data.get("sector") or sector,
                debt_market_cap_ratio=data.get("debt_to_market_cap") or debt_market_cap_ratio,
                interest_income_ratio=data.get("interest_to_revenue") or interest_income_ratio,
                checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            )
        except Exception as exc:
            logger.warning("Musaffa API failed for %s: %s — falling back to AAOIFI", ticker, exc)

    # --- AAOIFI fallback ---
    logger.debug("Halal screen %s: using AAOIFI fallback (debt=%.3f, interest=%.3f)",
                 ticker,
                 debt_market_cap_ratio or 0.0,
                 interest_income_ratio or 0.0)
    aaoifi_status = _aaoifi_classify(sector, debt_market_cap_ratio, interest_income_ratio)
    logger.info("Halal verdict for %s: %s (AAOIFI)", ticker, aaoifi_status)

    return HalalVerdict(
        ticker=ticker,
        status=aaoifi_status,  # type: ignore[arg-type]
        source="AAOIFI",
        sector=sector,
        debt_market_cap_ratio=debt_market_cap_ratio,
        interest_income_ratio=interest_income_ratio,
        checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
