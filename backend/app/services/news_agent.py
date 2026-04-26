"""OpenAI news analysis agent.

Uses GPT-4o-mini with response_format={"type":"json_object"}.
10s asyncio.wait_for hard timeout (T049).
4-field Arabic JSON output.

NEVER uses the Responses API — Chat Completions only.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional

from openai import AsyncOpenAI

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
    """Analyse news articles via GPT-4o-mini. Returns 4-field dict.

    Falls back to neutral/empty on any error or timeout.
    """
    settings = get_settings()

    if not articles:
        return _fallback_result()

    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not configured — returning neutral sentiment")
        return _fallback_result()

    name = company_name or ticker
    news_text = "\n\n".join(
        f"العنوان: {a['title']}\nالمصدر: {a['source']}\nالتاريخ: {a['published_at']}"
        + (f"\nالملخص: {a['snippet']}" if a.get("snippet") else "")
        for a in articles[:5]
    )

    user_prompt = f"الشركة: {name} (رمز التداول: {ticker})\n\nالأخبار:\n{news_text}"

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    try:
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=512,
                temperature=0.2,
            ),
            timeout=_AGENT_TIMEOUT,
        )
    except asyncio.TimeoutError:
        logger.warning("OpenAI timeout for %s", ticker)
        return _fallback_result()
    except Exception as exc:
        logger.warning("OpenAI error for %s: %s", ticker, exc)
        return _fallback_result()

    try:
        content = response.choices[0].message.content or "{}"
        data = json.loads(content)
    except (json.JSONDecodeError, IndexError, KeyError) as exc:
        logger.warning("Failed to parse OpenAI response for %s: %s", ticker, exc)
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
