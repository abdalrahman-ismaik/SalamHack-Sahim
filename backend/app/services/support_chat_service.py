"""Gemini-backed website support assistant for Sahim."""

from __future__ import annotations

import logging

import httpx

from app.config import get_settings
from app.models.support import SupportChatMessage

logger = logging.getLogger(__name__)

_GEMINI_MODEL = "gemini-1.5-flash"
_GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{_GEMINI_MODEL}:generateContent"
)

_SITE_CONTEXT = """
You are Sahim's support assistant. Sahim is an Arabic-first investment intelligence
web app for beginner investors. Services include:
- Stock Screener: search stocks and view an investment readiness score.
- Shariah Compliance / Halal Verdict: halal, non-halal, or purification-required screening.
- Risk Wizard: creates a beginner-friendly risk profile.
- ARIMA Forecast: statistical price forecast with confidence intervals.
- Portfolio Allocator: distributes a budget across selected tickers.
- Risk Dashboard: volatility, VaR, Sharpe, beta, and technical indicators.
- Sector Explorer: compares stocks and market sectors.
- News Agent: summarizes stock-market news and sentiment.
- Zakat Calculator: estimates zakat due on portfolio wealth.

Compliance rules:
- Never present content as licensed investment advice.
- Remind users that final halal verification is their responsibility when relevant.
- Explain where to click in the app; do not claim to perform trades or financial transactions.
- Keep answers concise, practical, and in the user's locale when possible.
"""


def _fallback_reply(message: str, locale: str) -> str:
    is_arabic = locale.startswith("ar")
    lower = message.lower()

    if is_arabic:
        if "زكاة" in message or "zakat" in lower:
            return "يمكنك استخدام حاسبة الزكاة من الشريط الجانبي. أدخل قيمة المحفظة والالتزامات، وسنعرض تقديراً معلوماتياً فقط."
        if "حلال" in message or "halal" in lower:
            return "افتح خدمة الامتثال الشرعي أو ابحث عن السهم من فاحص الأسهم. تذكير: التحقق النهائي من الحلية يقع على عاتق المستخدم."
        if "risk" in lower or "مخاطر" in message:
            return "ابدأ من كاشف المخاطر لإنشاء ملفك، ثم راقب المؤشرات من لوحة المخاطر. التحليل معلوماتي وليس نصيحة استثمارية."
        return "أنا مساعد سهم. أستطيع شرح الخدمات، مساعدتك في العثور على الصفحات، وتوضيح طريقة استخدام لوحة التحكم. ما الذي تريد الوصول إليه؟"

    if "zakat" in lower:
        return "Use the Zakat Calculator from the sidebar. Enter portfolio value and liabilities to get an informational estimate."
    if "halal" in lower or "sharia" in lower:
        return "Open Shariah Compliance or search a ticker in Stock Screener. Final halal verification remains your responsibility."
    if "risk" in lower:
        return "Start with Risk Wizard to create your profile, then use Risk Dashboard for deeper metrics. This is informational, not investment advice."
    return "I can explain Sahim services, help you find pages, and guide you around the dashboard. What would you like to do?"


def _contents_from_history(message: str, locale: str, history: list[SupportChatMessage]) -> list[dict]:
    contents: list[dict] = [
        {
            "role": "user",
            "parts": [{"text": f"{_SITE_CONTEXT}\nUser locale: {locale}"}],
        },
        {
            "role": "model",
            "parts": [{"text": "Understood. I will answer as Sahim's website support assistant."}],
        },
    ]

    for item in history[-6:]:
        contents.append({
            "role": "model" if item.role == "assistant" else "user",
            "parts": [{"text": item.content}],
        })

    contents.append({"role": "user", "parts": [{"text": message}]})
    return contents


async def ask_support_agent(
    message: str,
    locale: str,
    history: list[SupportChatMessage],
) -> tuple[str, str]:
    """Return (reply, source). Falls back gracefully when Gemini is unavailable."""
    settings = get_settings()
    if not settings.gemini_api_key:
        return _fallback_reply(message, locale), "fallback"

    payload = {
        "contents": _contents_from_history(message, locale, history),
        "generationConfig": {
            "temperature": 0.45,
            "topP": 0.9,
            "maxOutputTokens": 360,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                _GEMINI_URL,
                params={"key": settings.gemini_api_key},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
    except Exception as exc:  # pragma: no cover - remote integration fallback
        logger.warning("Gemini support chat failed: %s", exc)
        return _fallback_reply(message, locale), "fallback"

    try:
        reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        logger.warning("Unexpected Gemini response shape: %s", exc)
        return _fallback_reply(message, locale), "fallback"

    return reply or _fallback_reply(message, locale), "gemini"
