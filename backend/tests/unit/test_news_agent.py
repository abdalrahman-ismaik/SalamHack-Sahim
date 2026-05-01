"""Unit tests for news analysis fallbacks."""

from types import SimpleNamespace

import pytest

from app.services import news_agent


@pytest.mark.asyncio
async def test_analyse_news_uses_article_fallback_when_ai_keys_missing(monkeypatch):
    monkeypatch.setattr(
        news_agent,
        "get_settings",
        lambda: SimpleNamespace(gemini_api_key="", groq_api_key=""),
    )

    articles = [
        {
            "title": "Apple reports strong AI growth",
            "source": "demo",
            "published_at": "2026-05-01",
            "snippet": "Profit growth and AI demand improved the outlook.",
        }
    ]

    result = await news_agent.analyse_news("AAPL", articles, "Apple")

    assert result["summary_ar"]
    assert result["key_risks"]
    assert result["key_opportunities"]
    assert result["sentiment"] == "positive"
