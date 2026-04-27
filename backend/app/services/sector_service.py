"""Sector comparison service (T061/T062/T063).

Compares a ticker against its sector peers using Twelve Data fundamentals.
Returns SectorComparison model.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from app.exceptions import DataUnavailableError
from app.models.stock import SectorComparison
from app.services import market_data

logger = logging.getLogger(__name__)

# Sector → representative peer tickers (small curated list for demo)
_SECTOR_PEERS: dict[str, list[str]] = {
    "Technology": ["AAPL", "MSFT", "GOOGL", "META", "NVDA"],
    "Energy": ["XOM", "CVX", "BP", "SHEL", "TTE"],
    "Financial Services": ["JPM", "BAC", "WFC", "C", "GS"],
    "Consumer Cyclical": ["AMZN", "TSLA", "HD", "MCD", "NKE"],
    "Healthcare": ["JNJ", "PFE", "UNH", "MRK", "ABT"],
    "Utilities": ["NEE", "DUK", "SO", "D", "EXC"],
    "Industrials": ["BA", "GE", "MMM", "CAT", "HON"],
    "Real Estate": ["AMT", "PLD", "EQIX", "SPG", "PSA"],
    "Basic Materials": ["LIN", "APD", "ECL", "NEM", "FCX"],
    "Communication Services": ["NFLX", "DIS", "CMCSA", "VZ", "T"],
    "Consumer Defensive": ["WMT", "KO", "PEP", "PG", "COST"],
}


async def compare_sector(ticker: str, sector: Optional[str] = None) -> SectorComparison:
    """Return sector comparison data for a ticker."""
    # Attempt to get sector from fundamentals if not provided
    if not sector:
        try:
            fund = await market_data.get_fundamentals(ticker)
            sector = fund.get("sector") or "Unknown"
        except Exception:
            sector = "Unknown"

    logger.info("Sector compare for %s: sector=%s", ticker, sector)
    peers = _SECTOR_PEERS.get(sector, [])
    # Exclude the ticker itself
    peers = [p for p in peers if p.upper() != ticker.upper()][:4]

    # Fetch peer fundamentals concurrently
    peer_data: dict[str, dict] = {}
    if peers:
        results = await asyncio.gather(
            *[market_data.get_fundamentals(p) for p in peers],
            return_exceptions=True,
        )
        for p, r in zip(peers, results):
            if isinstance(r, dict):
                peer_data[p] = r
            else:
                logger.warning("Failed to fetch fundamentals for peer %s: %s", p, r)

    # Get subject ticker fundamentals
    try:
        subject_fund = await market_data.get_fundamentals(ticker)
    except DataUnavailableError:
        subject_fund = {}

    def _avg(key: str) -> Optional[float]:
        vals = [v.get(key) for v in peer_data.values() if v.get(key) is not None]
        return round(sum(vals) / len(vals), 4) if vals else None

    return SectorComparison(
        ticker=ticker,
        sector=sector,
        peer_tickers=peers,
        ticker_pe=subject_fund.get("pe_ratio"),
        sector_avg_pe=_avg("pe_ratio"),
        ticker_debt_equity=subject_fund.get("debt_equity"),
        sector_avg_debt_equity=_avg("debt_equity"),
        ticker_revenue_growth=subject_fund.get("revenue_growth"),
        sector_avg_revenue_growth=_avg("revenue_growth"),
    )
