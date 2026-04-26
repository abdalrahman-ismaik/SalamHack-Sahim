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
from typing import Any, Optional, Tuple

from cachetools import TTLCache

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


_cache: TTLCache = TTLCache(maxsize=_MAX_SIZE, ttl=_seconds_until_midnight())

# Short TTLs for certain endpoints that refresh more frequently
_SHORT_TTL_SECONDS = {
    "search": 3600,       # 1 hour
    "news": 3600,         # 1 hour
    "score": None,        # midnight (default)
    "halal": 86400,       # 24 h explicit
    "arima": 86400,       # 24 h explicit
    "sectors": 86400,
}

# Separate short-TTL cache for endpoints that don't need midnight rollover
_short_cache: TTLCache = TTLCache(maxsize=_MAX_SIZE, ttl=3600)


def _cache_for(endpoint: str) -> TTLCache:
    ttl = _SHORT_TTL_SECONDS.get(endpoint)
    if ttl is None:
        return _cache
    return _short_cache


def get_cached(ticker: str, endpoint: str) -> Optional[Any]:
    """Return cached value for (ticker, endpoint) or None if missing/expired."""
    key: Tuple[str, str] = (ticker.upper(), endpoint)
    return _cache_for(endpoint).get(key)


def set_cached(ticker: str, endpoint: str, value: Any) -> None:
    """Store value in the appropriate cache for (ticker, endpoint)."""
    key: Tuple[str, str] = (ticker.upper(), endpoint)
    _cache_for(endpoint)[key] = value
