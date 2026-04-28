"""Budget Allocator API (T069/T070)."""

from fastapi import APIRouter, HTTPException, status

from app.models.stock import AllocationRequest, AllocationResult
from app.services.allocator_service import allocate_budget

router = APIRouter(tags=["allocator"])


@router.post(
    "/allocate",
    response_model=AllocationResult,
)
async def post_allocate(body: AllocationRequest) -> AllocationResult:
    """Compute score-weighted budget allocation."""
    try:
        return await allocate_budget(body)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": str(exc)},
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "خطأ في الخادم أثناء حساب التوزيع"},
        ) from exc
