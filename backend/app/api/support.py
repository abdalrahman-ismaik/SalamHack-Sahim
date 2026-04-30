"""Support assistant API routes."""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.models.support import SupportChatRequest, SupportChatResponse
from app.services.support_chat_service import ask_support_agent

logger = logging.getLogger(__name__)

router = APIRouter(tags=["support"])


@router.post("/chat", response_model=SupportChatResponse)
async def support_chat(payload: SupportChatRequest) -> SupportChatResponse:
    """Answer product support questions using Gemini when configured."""
    reply, source = await ask_support_agent(
        message=payload.message,
        locale=payload.locale,
        history=payload.history,
    )
    return SupportChatResponse(reply=reply, source=source)
