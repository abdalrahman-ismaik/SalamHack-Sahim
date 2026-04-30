"""Pydantic models for the Sahim support chat endpoint."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class SupportChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2000)


class SupportChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    locale: str = Field(default="ar", max_length=8)
    history: list[SupportChatMessage] = Field(default_factory=list, max_length=8)


class SupportChatResponse(BaseModel):
    reply: str
    source: Literal["gemini", "fallback"]
