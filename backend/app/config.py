"""Application configuration via pydantic-settings.

All values are read from environment variables (or a .env file in the backend
directory). No secrets are ever hardcoded here.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional
import os
from dotenv import load_dotenv

from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Financial Data APIs ---
    # get keys from .env
    twelve_data_api_key: str = "" 
    alpha_vantage_api_key: str = ""

    # --- AI / News APIs ---
    gemini_api_key: str = ""
    newsapi_key: str = ""

    # --- Halal Screening ---
    musaffa_api_key: str = ""
    halal_screener_api_key: str = ""

    # --- CORS ---
    # Comma-separated list of allowed frontend origins (localhost vs 127.0.0.1 and ports differ).
    allowed_origins: str = (
        "http://localhost:3000,http://localhost:3001,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001"
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
