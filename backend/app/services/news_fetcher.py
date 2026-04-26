"""News fetcher: NewsAPI (primary) + GDELT DOC 2.0 (fallback).

NewsAPI free tier: 100 req/day, English results.
GDELT: unlimited free, query by company name.
"""

from __future__ import annotations

import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

_NEWSAPI_BASE = "https://newsapi.org/v2"
_GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"
_TIMEOUT = httpx.Timeout(8.0, connect=5.0)

MAX_ARTICLES = 5


async def fetch_news(ticker: str, company_name: Optional[str] = None) -> list[dict]:
    """Fetch up to MAX_ARTICLES news articles for a ticker.

    Returns list of dicts with keys: title, url, source, published_at, snippet.
    Returns empty list (news_unavailable) on total failure — caller handles graceful degradation.
    """
    settings = get_settings()

    # --- NewsAPI (primary) ---
    if settings.newsapi_key:
        query = company_name or ticker
        try:
            params = {
                "q": query,
                "sortBy": "publishedAt",
                "pageSize": MAX_ARTICLES,
                "language": "en",
                "apiKey": settings.newsapi_key,
            }
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.get(f"{_NEWSAPI_BASE}/everything", params=params)
                resp.raise_for_status()
                data = resp.json()

            articles = data.get("articles", [])
            if articles:
                return [
                    {
                        "title": a.get("title", ""),
                        "url": a.get("url", ""),
                        "source": a.get("source", {}).get("name", ""),
                        "published_at": a.get("publishedAt", ""),
                        "snippet": a.get("description"),
                    }
                    for a in articles[:MAX_ARTICLES]
                ]
        except Exception as exc:
            logger.warning("NewsAPI failed for %s: %s — trying GDELT", ticker, exc)

    # --- GDELT fallback ---
    query = company_name or ticker
    try:
        params = {
            "query": query,
            "mode": "ArtList",
            "maxrecords": MAX_ARTICLES,
            "format": "json",
            "sort": "DateDesc",
        }
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(_GDELT_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()

        articles = data.get("articles", [])
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
    except Exception as exc:
        logger.warning("GDELT failed for %s: %s", ticker, exc)

    return []
