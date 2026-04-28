"""
News fetcher: NewsAPI (primary) + GDELT fallback.

Design goal:
- NEVER fail the system
- Always return list (even empty)
- No exceptions propagate upward
"""

from __future__ import annotations

import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

NEWSAPI_BASE = "https://newsapi.org/v2"
GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"

_TIMEOUT = httpx.Timeout(8.0, connect=5.0)
MAX_ARTICLES = 5


# ---------------------------------------------------------------------------
# MAIN FUNCTION
# ---------------------------------------------------------------------------

async def fetch_news(ticker: str, company_name: Optional[str] = None) -> list[dict]:
    settings = get_settings()
    query = company_name or ticker

    # =========================
    # 1. NewsAPI (PRIMARY)
    # =========================
    try:
        if settings.newsapi_key:
            params = {
                "q": query,
                "sortBy": "publishedAt",
                "pageSize": MAX_ARTICLES,
                "language": "en",
                "apiKey": settings.newsapi_key,
            }

            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.get(f"{NEWSAPI_BASE}/everything", params=params)
                resp.raise_for_status()
                data = resp.json()

            articles = data.get("articles", [])
            if articles:
                return _normalize_news_api(articles)

    except Exception as exc:
        logger.warning("NewsAPI failed (%s): %s", ticker, exc)

    # =========================
    # 2. GDELT (FALLBACK)
    # =========================
    try:
        params = {
            "query": query,
            "mode": "ArtList",
            "maxrecords": MAX_ARTICLES,
            "format": "json",
            "sort": "DateDesc",
        }

        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(GDELT_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()

        articles = data.get("articles", [])
        if articles:
            return _normalize_gdelt(articles)

    except Exception as exc:
        logger.warning("GDELT failed (%s): %s", ticker, exc)

    # =========================
    # 3. SAFE FALLBACK (NEVER FAIL)
    # =========================
    return []


# ---------------------------------------------------------------------------
# NORMALIZERS
# ---------------------------------------------------------------------------

def _normalize_news_api(articles: list[dict]) -> list[dict]:
    return [
        {
            "title": a.get("title", ""),
            "url": a.get("url", ""),
            "source": a.get("source", {}).get("name", ""),
            "published_at": a.get("publishedAt", ""),
            "snippet": a.get("description", ""),
        }
        for a in articles[:MAX_ARTICLES]
    ]


def _normalize_gdelt(articles: list[dict]) -> list[dict]:
    return [
        {
            "title": a.get("title", ""),
            "url": a.get("url", ""),
            "source": a.get("domain", ""),
            "published_at": a.get("seendate", ""),
            "snippet": None,
        }
        for a in articles[:MAX_ARTICLES]
    ]