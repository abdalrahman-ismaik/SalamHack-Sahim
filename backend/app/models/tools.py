"""Pydantic models for the /api/tools endpoints."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class GoldPriceResponse(BaseModel):
    """Response model for GET /api/tools/gold-price."""

    price_per_gram_usd: float = Field(..., description="Gold price per gram in USD")
    price_per_gram_aed: float = Field(..., description="Gold price per gram in AED")
    price_per_gram_sar: float = Field(..., description="Gold price per gram in SAR")
    source: Literal["TwelveData", "static"] = Field(
        ..., description="Data source — 'static' when live API is unavailable"
    )
    date: str = Field(..., description="ISO 8601 date string for the price quote")
