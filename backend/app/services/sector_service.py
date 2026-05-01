"""Sector comparison service (T061/T062/T063).

Compares a ticker against its sector peers using Twelve Data fundamentals.
Returns SectorComparison model.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from app.models.stock import SectorComparison, SectorStock
from app.services import market_data
from app.services.score_engine import compute_score

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
    peers = [p for p in _SECTOR_PEERS.get(sector, []) if p.upper() != ticker.upper()][:4]

    async def _score_stock(symbol: str) -> Optional[SectorStock]:
        try:
            ohlcv = await market_data.get_ohlcv(symbol, days=365)
            closes = ohlcv.get("closes") or []
            if len(closes) < 2:
                return None
            score = compute_score(symbol, symbol, closes, "neutral")
            return SectorStock(
                ticker=symbol,
                name=score.name,
                composite_score=score.composite_score,
                band=score.band,
            )
        except Exception as exc:
            logger.warning("Failed sector score for %s: %s", symbol, exc)
            return None

    scored = await asyncio.gather(*[_score_stock(p) for p in peers], return_exceptions=False)
    top_stocks = [item for item in scored if item is not None]

    if not top_stocks:
        # Keep endpoint stable even when peer data is missing for an index ticker like TASI.
        top_stocks = []
        avg_score = 50.0
    else:
        avg_score = round(sum(item.composite_score for item in top_stocks) / len(top_stocks), 2)

    return SectorComparison(
        sector=sector,
        avg_score=avg_score,
        stock_count=len(top_stocks),
        top_stocks=top_stocks,
    )
