"""Sectors API routes (T062/T063)."""

import logging

from fastapi import APIRouter, HTTPException, status

from app.cache import get_cached, set_cached
from app.exceptions import DataUnavailableError, InvalidTickerError
from app.models.stock import SectorComparison
from app.services.sector_service import compare_sector

logger = logging.getLogger(__name__)
router = APIRouter(tags=["sectors"])

_TICKER_RE = __import__("re").compile(r"^[A-Z0-9.]{1,10}$")


def _validate_ticker(ticker: str) -> str:
    t = ticker.upper().strip()
    if not _TICKER_RE.match(t):
        raise InvalidTickerError(t)
    return t


@router.get(
    "/sectors/{ticker}",
    response_model=SectorComparison,
)
async def get_sector_comparison(ticker: str) -> SectorComparison:
    """Return sector peer comparison for a ticker."""
    logger.info("GET /sectors/%s", ticker)
    try:
        ticker = _validate_ticker(ticker)
    except InvalidTickerError as exc:
        logger.warning("Invalid ticker for sector comparison: %r", ticker)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "رمز السهم غير صالح", "code": "INVALID_TICKER"},
        ) from exc

    cached = get_cached(ticker, "sector")
    if cached is not None:
        return cached

    try:
        result = await compare_sector(ticker)
    except DataUnavailableError as exc:
        logger.warning("Sector data unavailable for %s: %s", ticker, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "بيانات القطاع غير متاحة", "ticker": ticker, "detail": str(exc)},
        ) from exc

    logger.debug("Sector comparison for %s: sector=%s, peers=%s", ticker, result.sector, result.peer_tickers)
    set_cached(ticker, "sector", result)
    return result


@router.get("/sectors")
async def list_sectors() -> list[str]:
    """Return list of tracked sector names."""
    from app.services.sector_service import _SECTOR_PEERS
    return sorted(_SECTOR_PEERS.keys())
