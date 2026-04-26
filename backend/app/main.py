"""FastAPI application entry point.

Registers:
- CORS middleware (origins from settings.allowed_origins_list)
- All API routers
- Global 422 / 500 exception handlers with Arabic error bodies
- GET /api/health liveness endpoint (T010)
"""

from __future__ import annotations

import datetime
import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="sSsahim API",
    description="Arabic Investment Intelligence backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    logger.warning("Validation error for %s: %s", request.url, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "بيانات الطلب غير صالحة — يرجى التحقق من المدخلات",
            "code": "VALIDATION_ERROR",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception for %s", request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "حدث خطأ داخلي في الخادم — يرجى المحاولة لاحقاً",
            "code": "INTERNAL_SERVER_ERROR",
        },
    )


# ---------------------------------------------------------------------------
# Health check (T010) — used by Render.com liveness probe
# ---------------------------------------------------------------------------


@app.get("/api/health", tags=["health"])
async def health_check() -> dict[str, Any]:
    return {
        "status": "ok",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Routers — imported after app is created to avoid circular imports
# ---------------------------------------------------------------------------
from app.api.stock import router as stock_router  # noqa: E402
from app.api.sectors import router as sectors_router  # noqa: E402
from app.api.allocator import router as allocator_router  # noqa: E402

app.include_router(stock_router, prefix="/api")
app.include_router(sectors_router, prefix="/api")
app.include_router(allocator_router, prefix="/api")
