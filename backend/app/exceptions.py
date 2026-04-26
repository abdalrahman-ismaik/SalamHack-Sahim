"""Custom exception types for the sSsahim backend."""

from __future__ import annotations


class DataUnavailableError(Exception):
    """Raised when market data cannot be retrieved from any source."""

    def __init__(self, ticker: str, detail: str = "") -> None:
        self.ticker = ticker
        self.detail = detail
        super().__init__(f"Data unavailable for {ticker}: {detail}")


class InvalidTickerError(ValueError):
    """Raised when a ticker symbol fails validation."""

    pass
