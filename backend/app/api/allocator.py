"""Budget Allocator API (T069/T070)."""

import logging

from fastapi import APIRouter, HTTPException, status

from app.models.stock import AllocationRequest, AllocationResult
from app.services.allocator_service import allocate_budget

logger = logging.getLogger(__name__)
router = APIRouter(tags=["allocator"])


@router.post(
    "/allocate",
    response_model=AllocationResult,
)
async def post_allocate(body: AllocationRequest) -> AllocationResult:
    """Compute score-weighted budget allocation."""
    logger.info("POST /allocate tickers=%s budget=%s", body.tickers, body.budget)
    try:
        result = await allocate_budget(body)
        logger.debug("allocation complete — %d positions", len(result.allocations))
        return result
    except ValueError as exc:
        logger.warning("Allocation validation error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": str(exc)},
        ) from exc
    except Exception as exc:
        logger.exception("Unhandled allocation error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "خطأ في الخادم أثناء حساب التوزيع"},
        ) from exc
