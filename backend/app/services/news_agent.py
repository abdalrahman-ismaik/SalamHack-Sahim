"""News analysis agent (Groq primary).

Uses Groq Chat Completions API (OpenAI-compatible) with JSON output mode.
Returns a normalized 5-field dict for frontend consumption.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

_AGENT_TIMEOUT = 30.0  # seconds
_GROQ_API_BASE = "https://api.groq.com/openai/v1/chat/completions"
_CANDIDATE_MODELS = (
    # Try light model first, then stronger one.
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
)

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
    """Analyse news articles via Groq LLM endpoint.

    Falls back to heuristic extraction on timeout/error.
    """
    settings = get_settings()

    if not articles:
        return _fallback_result()

    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY not configured — returning fallback sentiment")
        return _fallback_result()

    name = company_name or ticker
    news_text = "\n\n".join(
        f"العنوان: {a['title']}\nالمصدر: {a['source']}\nالتاريخ: {a['published_at']}"
        + (f"\nالملخص: {a['snippet']}" if a.get("snippet") else "")
        for a in articles[:5]
    )

    user_prompt = (
        f"{_SYSTEM_PROMPT}\n\n"
        f"الشركة: {name} (رمز التداول: {ticker})\n\nالأخبار:\n{news_text}"
    )

    raw_content: str | None = None
    for model_name in _CANDIDATE_MODELS:
        try:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": "أنت محلل مالي خبير. أعد JSON فقط."},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.2,
                "max_tokens": 600,
                "response_format": {"type": "json_object"},
            }
            headers = {
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            }
            async with httpx.AsyncClient(timeout=httpx.Timeout(_AGENT_TIMEOUT)) as client:
                resp = await asyncio.wait_for(
                    client.post(_GROQ_API_BASE, json=payload, headers=headers),
                    timeout=_AGENT_TIMEOUT,
                )
                resp.raise_for_status()
                data = resp.json()
            raw_content = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )
            logger.debug("Groq model %s succeeded for %s", model_name, ticker)
            break
        except asyncio.TimeoutError:
            logger.warning("Groq timeout for %s on model %s", ticker, model_name)
        except Exception as exc:
            logger.warning("Groq error for %s on model %s: %s", ticker, model_name, exc)

    if raw_content is None:
        return _fallback_result(articles)

    try:
        content = raw_content or "{}"
        logger.debug("Raw Groq response for %s: %r", ticker, content)

        # Clean markdown codeblocks in case the model ignored response_mime_type
        content = content.strip()
        if content.startswith("```"):
            lines = content.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        data = json.loads(content)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Failed to parse Groq response for %s: %s\nRaw content: %r", ticker, exc, content)
        return _fallback_result(articles)

    return {
        "sentiment": data.get("sentiment", "neutral"),
        "summary_ar": data.get("summary_ar", _fallback_summary_ar(articles)),
        "summary_en": "",
        "key_risks": data.get("key_risks", []),
        "key_opportunities": data.get("key_opportunities", []),
    }


def _fallback_summary_ar(articles: list[dict]) -> str:
    titles = [str(a.get("title", "")).strip() for a in articles[:3] if str(a.get("title", "")).strip()]
    if not titles:
        return ""
    # Simple deterministic fallback summary in Arabic when AI is unavailable.
    return "ملخص إخباري سريع: " + " | ".join(titles)


def _fallback_key_points(articles: list[dict]) -> tuple[list[str], list[str], str]:
    """Derive simple risk/opportunity bullets from article titles/snippets.

    Keeps the endpoint useful even when Gemini quota is exhausted.
    """
    corpus = " ".join(
        f"{a.get('title', '')} {a.get('snippet', '')}" for a in articles[:5]
    ).lower()

    risk_rules = [
        ("lawsuit", "مخاطر قانونية محتملة مرتبطة بالدعاوى أو النزاعات."),
        ("regulat", "مخاطر تنظيمية قد تؤثر على الأداء المستقبلي."),
        ("tariff", "تأثير محتمل للتعريفات والقيود التجارية على التكاليف."),
        ("cut", "إشارات إلى تخفيضات أو ضعف في التوقعات التشغيلية."),
        ("decline", "مؤشرات على تراجع في الطلب أو الإيرادات."),
        ("bear", "معنويات سوقية سلبية قد تزيد التقلبات."),
    ]
    opp_rules = [
        ("growth", "إشارات نمو قد تدعم الأداء في الفترات القادمة."),
        ("launch", "إطلاق منتجات/خدمات جديدة قد يفتح فرص إيراد."),
        ("partnership", "شراكات محتملة قد توسع الوصول للسوق."),
        ("upgrade", "تقييمات أو تحديثات إيجابية قد تدعم الزخم."),
        ("ai", "التوسع في مبادرات الذكاء الاصطناعي قد يعزز القيمة."),
        ("profit", "تحسن الربحية قد يدعم النظرة الاستثمارية."),
    ]

    risks = [text for keyword, text in risk_rules if keyword in corpus][:3]
    opps = [text for keyword, text in opp_rules if keyword in corpus][:3]

    sentiment = "neutral"
    if len(opps) > len(risks):
        sentiment = "positive"
    elif len(risks) > len(opps):
        sentiment = "negative"

    # Ensure non-empty informative output
    if not risks and articles:
        risks = ["تقلبات السوق الإخبارية قد تؤثر على حركة السهم قصيرة الأجل."]
    if not opps and articles:
        opps = ["تدفق الأخبار المستمر يوفر فرص متابعة وتوقيت أفضل للقرار."]

    return risks, opps, sentiment


def _fallback_result(articles: list[dict] | None = None) -> dict:
    src = articles or []
    key_risks, key_opps, sentiment = _fallback_key_points(src)
    return {
        "sentiment": sentiment,
        "summary_ar": _fallback_summary_ar(src),
        "summary_en": "",
        "key_risks": key_risks,
        "key_opportunities": key_opps,
    }
