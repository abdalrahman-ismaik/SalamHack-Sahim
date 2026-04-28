"""Application configuration via pydantic-settings.

All values are read from environment variables (or a .env file in the backend
directory). No secrets are ever hardcoded here.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Financial Data APIs ---
    twelve_data_api_key: str = ""
    alpha_vantage_api_key: str = ""

    # --- AI / News APIs ---
    gemini_api_key: str = ""
    newsapi_key: str = ""

    # --- Halal Screening ---
    halal_terminal_api_key: str = Field("", env=("halal_terminal_api_key", "musaffa_api_key"))

    # --- CORS ---
    # Comma-separated list of allowed frontend origins
    allowed_origins: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()
