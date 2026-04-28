"""Stock API routes.

Endpoints:
    GET /api/search?q={query}           — T020
    GET /api/stock/{ticker}/score       — T021
    GET /api/stock/{ticker}/risk        — T033 (risk panel)
"""

from __future__ import annotations

import re
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.cache import get_cached, set_cached
from app.exceptions import DataUnavailableError, InvalidTickerError
from app.models.stock import ArimaForecast, HalalVerdict, InvestmentReadinessScore, NewsAnalysis, RiskMetrics, SearchResult
from app.services import market_data
from app.services.risk_service import compute_risk_metrics
from app.services.halal_screener import get_halal_verdict
from app.services.news_fetcher import fetch_news
from app.services.news_agent import analyse_news
from app.services.arima_service import compute_arima_forecast

router = APIRouter(tags=["stocks"])

# Ticker validation pattern (T021)
_TICKER_RE = re.compile(r"^[A-Z0-9.]{1,10}$")


def _validate_ticker(ticker: str) -> str:
    normalised = ticker.upper().strip()
    if not _TICKER_RE.match(normalised):
        raise InvalidTickerError(f"Invalid ticker: {ticker!r}")
    return normalised


def _data_unavailable_response(ticker: str, detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "error": "تعذّر الحصول على بيانات السوق — يرجى المحاولة لاحقاً",
            "code": "DATA_UNAVAILABLE",
            "ticker": ticker,
            "detail": detail,
        },
    )


# ---------------------------------------------------------------------------
# GET /api/search
# ---------------------------------------------------------------------------


@router.get("/search", response_model=list[SearchResult])
async def search_stocks(
    q: Annotated[str, Query(min_length=1, max_length=50, description="Ticker or company name query")],
) -> list[SearchResult]:
    """Search for stocks by ticker or company name."""
    cached = get_cached(q.lower(), "search")
    if cached is not None:
        return cached

    try:
        results = await market_data.search_stocks(q)
    except DataUnavailableError as exc:
        raise _data_unavailable_response(q, str(exc)) from exc

    output = [SearchResult(**r) for r in results]
    set_cached(q.lower(), "search", output)
    return output


# ---------------------------------------------------------------------------
# GET /api/stock/{ticker}/score
# ---------------------------------------------------------------------------


@router.get(
    "/stock/{ticker}/score",
    response_model=InvestmentReadinessScore,
)
async def get_score(ticker: str) -> InvestmentReadinessScore:
    """Compute Investment Readiness Score for a single ticker."""
    try:
        ticker = _validate_ticker(ticker)
    except InvalidTickerError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "رمز السهم غير صالح",
                "code": "INVALID_TICKER",
            },
        ) from exc

    cached = get_cached(ticker, "score")
    if cached is not None:
        return cached

    # 1. Fetch OHLCV
    try:
        ohlcv = await market_data.get_ohlcv(ticker, days=365)
    except DataUnavailableError as exc:
        raise _data_unavailable_response(ticker, str(exc)) from exc

    closes = ohlcv["closes"]
    if not closes:
        raise _data_unavailable_response(ticker, "empty price series")

    # 2. Fetch quote for name
    try:
        quote = await market_data.get_quote(ticker)
        name = quote.get("name", ticker)
    except DataUnavailableError:
        name = ticker

    # 3. Sentiment — fetch news and run AI analysis (T050)
    try:
        articles = await fetch_news(ticker, name)
        analysis = await analyse_news(ticker, articles, name)
        sentiment: str = analysis.get("sentiment", "neutral")
    except Exception:
        sentiment = "neutral"

    # 4. Compute score (beta=1.0 default; full beta calc wired in risk endpoint)
    from app.services.score_engine import compute_score

    result = compute_score(ticker, name, closes, sentiment)  # type: ignore[arg-type]

    set_cached(ticker, "score", result)
    return result


# ---------------------------------------------------------------------------
# GET /api/stock/{ticker}/risk  (T033)
# ---------------------------------------------------------------------------


@router.get(
    "/stock/{ticker}/risk",
    response_model=RiskMetrics,
)
async def get_risk(ticker: str) -> RiskMetrics:
    """Return full risk metrics for a ticker."""
    try:
        ticker = _validate_ticker(ticker)
    except InvalidTickerError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "رمز السهم غير صالح", "code": "INVALID_TICKER"},
        ) from exc

    cached = get_cached(ticker, "risk")
    if cached is not None:
        return cached

    try:
        result = await compute_risk_metrics(ticker)
    except DataUnavailableError as exc:
        raise _data_unavailable_response(ticker, str(exc)) from exc

    set_cached(ticker, "risk", result)
    return result


# ---------------------------------------------------------------------------
# GET /api/stock/{ticker}/halal  (T040)
# ---------------------------------------------------------------------------


@router.get(
    "/stock/{ticker}/halal",
    response_model=HalalVerdict,
)
async def get_halal(ticker: str) -> HalalVerdict:
    """Return Halal compliance verdict for a ticker."""
    try:
        ticker = _validate_ticker(ticker)
    except InvalidTickerError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "رمز السهم غير صالح", "code": "INVALID_TICKER"},
        ) from exc

    cached = get_cached(ticker, "halal")
    if cached is not None:
        return cached

    # Fetch fundamentals for AAOIFI fallback ratios
    try:
        fund = await market_data.get_fundamentals(ticker)
    except Exception:
        fund = {}

    result = await get_halal_verdict(
        ticker=ticker,
        sector=None,
        debt_market_cap_ratio=fund.get("debt_market_cap_ratio"),
        prohibited_income_pct=fund.get("prohibited_income_pct"),
    )
    set_cached(ticker, "halal", result)
    return result


# ---------------------------------------------------------------------------
# GET /api/stock/{ticker}/news  (T047)
# ---------------------------------------------------------------------------


@router.get(
    "/stock/{ticker}/news",
    response_model=NewsAnalysis,
)
async def get_news(ticker: str) -> NewsAnalysis:
    """Return AI news analysis for a ticker (T047/T048/T049)."""
    try:
        ticker = _validate_ticker(ticker)
    except InvalidTickerError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "رمز السهم غير صالح", "code": "INVALID_TICKER"},
        ) from exc

    cached = get_cached(ticker, "news")
    if cached is not None:
        return cached

    try:
        quote = await market_data.get_quote(ticker)
        company_name = quote.get("name")
    except Exception:
        company_name = None

    # news_unavailable is handled gracefully — never raises 503
    articles = await fetch_news(ticker, company_name)
    analysis = await analyse_news(ticker, articles, company_name)

    import datetime

    result = NewsAnalysis(
        ticker=ticker,
        sentiment=analysis["sentiment"],  # type: ignore[arg-type]
        summary_ar=analysis.get("summary_ar", ""),
        summary_en=analysis.get("summary_en", ""),
        key_risks=analysis.get("key_risks", []),
        key_opportunities=analysis.get("key_opportunities", []),
        articles=[],  # raw articles not returned to frontend
        news_unavailable=len(articles) == 0,
        analysed_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
    # TTL=1h handled by _short_cache in cache.py
    set_cached(ticker, "news", result)
    return result


# ---------------------------------------------------------------------------
# GET /api/stock/{ticker}/forecast  (T054)
# ---------------------------------------------------------------------------


@router.get(
    "/stock/{ticker}/forecast",
    response_model=ArimaForecast,
)
async def get_forecast(ticker: str) -> ArimaForecast:
    """Return 30-day ARIMA price forecast with 95% CI."""
    try:
        ticker = _validate_ticker(ticker)
    except InvalidTickerError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "رمز السهم غير صالح", "code": "INVALID_TICKER"},
        ) from exc

    cached = get_cached(ticker, "forecast")
    if cached is not None:
        return cached

    try:
        result = await compute_arima_forecast(ticker)
    except DataUnavailableError as exc:
        raise _data_unavailable_response(ticker, str(exc)) from exc

    set_cached(ticker, "forecast", result)
    return result
