"""Budget allocator service (T067/T068/T069).

Score-weighted proportional allocation.
Zero-shares guard: if no ticker has score > 0, distribute equally.
Disclaimer const: "تحليل معلوماتي مستقل، وليس نصيحة استثمارية مرخصة"
"""

from __future__ import annotations

import logging
from typing import Optional

from app.models.stock import AllocationRequest, AllocationResult
from app.services.score_engine import compute_score
from app.services import market_data
from app.exceptions import DataUnavailableError

logger = logging.getLogger(__name__)

_MIN_SHARES = 1  # minimum whole shares per ticker


async def allocate_budget(request: AllocationRequest) -> AllocationResult:
    """Compute score-weighted stock allocation for a given budget."""
    budget = request.budget
    tickers = list(dict.fromkeys(request.tickers))  # deduplicate preserving order
    logger.info("allocate_budget: budget=%s tickers=%s", budget, tickers)

    if not tickers:
        raise ValueError("No tickers provided")

    # 1. Gather scores for each ticker
    scores: dict[str, float] = {}
    prices: dict[str, float] = {}

    for ticker in tickers:
        try:
            ohlcv = await market_data.get_ohlcv(ticker, days=365)
            closes = ohlcv["closes"]
            quote = await market_data.get_quote(ticker)
            price = float(quote.get("price") or (closes[-1] if closes else 0))
            prices[ticker] = price

            score_obj = compute_score(ticker, ticker, closes, "neutral")
            scores[ticker] = float(score_obj.score)
        except Exception as exc:
            logger.warning("Failed to score %s for allocation: %s", ticker, exc)
            scores[ticker] = 0.0
            prices[ticker] = 0.0

    total_score = sum(scores.values())

    # Zero-shares guard: if all scores are 0, distribute equally
    if total_score == 0:
        equal = 1.0 / len(tickers)
        weights = {t: equal for t in tickers}
    else:
        weights = {t: scores[t] / total_score for t in tickers}

    # 2. Compute allocation
    allocations: list[dict] = []
    allocated_total = 0.0

    for ticker in tickers:
        price = prices.get(ticker, 0.0)
        weight = weights[ticker]
        budget_portion = budget * weight

        if price > 0:
            shares = int(budget_portion // price)
            # Zero-shares guard (T068): ensure at least 1 share if budget allows
            if shares == 0 and budget_portion >= price:
                shares = _MIN_SHARES
        else:
            shares = 0

        cost = shares * price
        allocated_total += cost

        allocations.append(
            {
                "ticker": ticker,
                "weight": round(weight, 4),
                "shares": shares,
                "price_per_share": round(price, 4),
                "total_cost": round(cost, 2),
                "score": round(scores[ticker], 1),
            }
        )

    remaining_cash = round(budget - allocated_total, 2)

    return AllocationResult(
        budget=budget,
        allocated_total=round(allocated_total, 2),
        remaining_cash=remaining_cash,
        allocations=allocations,
    )
