"""In-memory TTL cache for EOD market data responses.

Cache key: (ticker: str, endpoint: str)
TTL: seconds remaining until midnight UTC (data refreshes daily with new EOD session).

Usage:
    cached = get_cached("2222.SR", "score")
    if cached is None:
        result = await compute(...)
        set_cached("2222.SR", "score", result)
    else:
        result = cached
"""

from __future__ import annotations

import datetime
import logging
from typing import Any, Optional, Tuple

from cachetools import TTLCache

logger = logging.getLogger(__name__)

# Maximum number of distinct (ticker, endpoint) entries to keep in memory.
# 512 entries × average ~2 KB payload ≈ ~1 MB — safe for Render.com free tier (512 MB RAM).
_MAX_SIZE = 512

# Build a cache whose TTL is refreshed on each module load.
# In practice the process stays alive, so we use a single cache instance and
# rely on _seconds_until_midnight() to set an appropriate TTL at creation time.
# For a hackathon deployment this is sufficient; a production system would
# recompute TTL on each insertion.
def _seconds_until_midnight() -> int:
    now = datetime.datetime.now(datetime.timezone.utc)
    tomorrow = (now + datetime.timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return max(1, int((tomorrow - now).total_seconds()))


_daily_cache: TTLCache = TTLCache(maxsize=_MAX_SIZE, ttl=_seconds_until_midnight())

# Endpoint TTLs. None means daily market rollover via _daily_cache.
_ENDPOINT_TTL_SECONDS: dict[str, int | None] = {
    "search": 3600,
    "news": 3600,
    "gold-price": 3600,
    "score": None,
    "risk": None,
    "halal": 86400,
    "forecast": 86400,
    "arima": 86400,
    "sector": 86400,
    "sectors": 86400,
}

_ttl_caches: dict[int, TTLCache] = {}


def _normalize_endpoint(endpoint: str) -> str:
    return endpoint.strip().lower().replace("_", "-")


def _normalize_subject(ticker: str) -> str:
    return ticker.strip().upper()


def _cache_for(endpoint: str) -> TTLCache:
    normalized_endpoint = _normalize_endpoint(endpoint)
    ttl = _ENDPOINT_TTL_SECONDS.get(normalized_endpoint)
    if ttl is None:
        return _daily_cache
    if ttl not in _ttl_caches:
        _ttl_caches[ttl] = TTLCache(maxsize=_MAX_SIZE, ttl=ttl)
    return _ttl_caches[ttl]


def get_cached(ticker: str, endpoint: str) -> Optional[Any]:
    """Return cached value for (ticker, endpoint) or None if missing/expired."""
    subject = _normalize_subject(ticker)
    endpoint_name = _normalize_endpoint(endpoint)
    key: Tuple[str, str] = (subject, endpoint_name)
    value = _cache_for(endpoint_name).get(key)
    if value is not None:
        logger.debug("cache HIT  %s/%s", subject, endpoint_name)
    else:
        logger.debug("cache MISS %s/%s", subject, endpoint_name)
    return value


def set_cached(ticker: str, endpoint: str, value: Any) -> None:
    """Store value in the appropriate cache for (ticker, endpoint)."""
    subject = _normalize_subject(ticker)
    endpoint_name = _normalize_endpoint(endpoint)
    key: Tuple[str, str] = (subject, endpoint_name)
    logger.debug("cache SET  %s/%s", subject, endpoint_name)
    _cache_for(endpoint_name)[key] = value
