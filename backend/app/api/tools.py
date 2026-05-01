"""API router for /api/tools endpoints."""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.cache import get_cached, set_cached
from app.models.tools import GoldPriceResponse
from app.services.gold_service import get_gold_price

logger = logging.getLogger(__name__)

router = APIRouter(tags=["tools"])

@router.get("/gold-price", response_model=GoldPriceResponse)
async def gold_price_endpoint() -> GoldPriceResponse:
    """Return the current gold price per gram in USD, AED, and SAR.

    Cached for 1 hour. Falls back to static values when Twelve Data is
    unavailable, so this endpoint always returns 200.
    """
    cached = get_cached("__global__", "gold-price")
    if cached is not None:
        return GoldPriceResponse(**cached)

    data = await get_gold_price()
    set_cached("__global__", "gold-price", data)
    return GoldPriceResponse(**data)
