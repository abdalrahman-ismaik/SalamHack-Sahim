"""Gemini news analysis agent.

Uses gemini-2.0-flash (free tier: 1,500 req/day) with JSON response mode.
10s asyncio.wait_for hard timeout (T049).
4-field Arabic JSON output.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional

from google import genai
from google.genai import types

from app.config import get_settings

logger = logging.getLogger(__name__)

_AGENT_TIMEOUT = 10.0  # seconds

_SYSTEM_PROMPT = """أنت محلل مالي خبير. بناءً على الأخبار المُقدَّمة، أجب بصيغة JSON فقط بالحقول التالية:
{
  "sentiment": "positive" أو "neutral" أو "negative",
  "summary_ar": "ملخص عربي موجز (3 جمل كحد أقصى)",
  "key_risks": ["خطر 1", "خطر 2"],
  "key_opportunities": ["فرصة 1", "فرصة 2"]
}
لا تُضِف أي نص خارج JSON."""


async def analyse_news(
    ticker: str,
    articles: list[dict],
    company_name: Optional[str] = None,
) -> dict:
    """Analyse news articles via Gemini 2.0 Flash. Returns 4-field dict.

    Falls back to neutral/empty on any error or timeout.
    """
    settings = get_settings()

    if not articles:
        return _fallback_result()

    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY not configured — returning neutral sentiment")
        return _fallback_result()

    name = company_name or ticker
    news_text = "\n\n".join(
        f"العنوان: {a['title']}\nالمصدر: {a['source']}\nالتاريخ: {a['published_at']}"
        + (f"\nالملخص: {a['snippet']}" if a.get("snippet") else "")
        for a in articles[:5]
    )

    prompt = (
        f"{_SYSTEM_PROMPT}\n\n"
        f"الشركة: {name} (رمز التداول: {ticker})\n\nالأخبار:\n{news_text}"
    )

    client = genai.Client(api_key=settings.gemini_api_key)

    try:
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    max_output_tokens=512,
                    temperature=0.2,
                ),
            ),
            timeout=_AGENT_TIMEOUT,
        )
    except asyncio.TimeoutError:
        logger.warning("Gemini timeout for %s", ticker)
        return _fallback_result()
    except Exception as exc:
        logger.warning("Gemini error for %s: %s", ticker, exc)
        return _fallback_result()

    try:
        content = response.text or "{}"
        data = json.loads(content)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("Failed to parse Gemini response for %s: %s", ticker, exc)
        return _fallback_result()

    return {
        "sentiment": data.get("sentiment", "neutral"),
        "summary_ar": data.get("summary_ar", ""),
        "summary_en": "",
        "key_risks": data.get("key_risks", []),
        "key_opportunities": data.get("key_opportunities", []),
    }


def _fallback_result() -> dict:
    return {
        "sentiment": "neutral",
        "summary_ar": "",
        "summary_en": "",
        "key_risks": [],
        "key_opportunities": [],
    }

def _fallback_result() -> dict:
    return {
        "sentiment": "neutral",
        "summary_ar": "",
        "summary_en": "",
        "key_risks": [],
        "key_opportunities": [],
    }
