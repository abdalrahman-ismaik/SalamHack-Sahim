"""Unit tests for score_engine normalisation functions and band classification.
T036
"""

import pytest
from app.services.score_engine import (
    _band,
    _normalise_beta,
    _normalise_sentiment,
    _normalise_sharpe,
    _normalise_var,
    _normalise_volatility,
)


class TestNormaliseVolatility:
    def test_zero_volatility(self):
        assert _normalise_volatility(0.0) == 100.0

    def test_max_volatility(self):
        # At σ=0.60, score should be 0
        assert _normalise_volatility(0.60) == pytest.approx(0.0, abs=1e-6)

    def test_half_max(self):
        # At σ=0.30, score ≈ 50
        assert _normalise_volatility(0.30) == pytest.approx(50.0, abs=1e-4)

    def test_clamp_below_zero(self):
        # Excessive volatility should not go below 0
        assert _normalise_volatility(1.0) == 0.0

    def test_typical(self):
        # σ=0.20 → 100 - (0.20/0.60)*100 ≈ 66.67
        result = _normalise_volatility(0.20)
        assert 66.0 < result < 67.0


class TestNormaliseVaR:
    def test_zero_var(self):
        assert _normalise_var(0.0) == 100.0

    def test_max_var(self):
        assert _normalise_var(0.05) == pytest.approx(0.0, abs=1e-6)

    def test_clamp(self):
        assert _normalise_var(0.10) == 0.0

    def test_midpoint(self):
        result = _normalise_var(0.025)
        assert result == pytest.approx(50.0, abs=1e-4)


class TestNormaliseSharpe:
    def test_excellent_sharpe(self):
        # Sharpe=2 → min(100, max(0,(2+1)/3*100)) = 100
        assert _normalise_sharpe(2.0) == 100.0

    def test_zero_sharpe(self):
        # Sharpe=0 → (0+1)/3*100 ≈ 33.33
        result = _normalise_sharpe(0.0)
        assert 33.0 < result < 34.0

    def test_negative_sharpe(self):
        # Sharpe=-1 → (−1+1)/3*100 = 0
        assert _normalise_sharpe(-1.0) == pytest.approx(0.0, abs=1e-6)

    def test_deep_negative_clamp(self):
        assert _normalise_sharpe(-5.0) == 0.0


class TestNormaliseBeta:
    def test_beta_one(self):
        # β=1 → 100 - abs(1-1)*50 = 100
        assert _normalise_beta(1.0) == 100.0

    def test_beta_zero(self):
        # β=0 → 100 - 1*50 = 50
        assert _normalise_beta(0.0) == 50.0

    def test_beta_three(self):
        # β=3 → 100 - 2*50 = 0
        assert _normalise_beta(3.0) == 0.0

    def test_clamp(self):
        assert _normalise_beta(10.0) == 0.0


class TestNormaliseSentiment:
    def test_positive(self):
        assert _normalise_sentiment("positive") == 80.0

    def test_neutral(self):
        assert _normalise_sentiment("neutral") == 50.0

    def test_negative(self):
        assert _normalise_sentiment("negative") == 20.0

    def test_unknown_defaults_neutral(self):
        assert _normalise_sentiment("unknown") == 50.0


class TestBand:
    def test_green(self):
        assert _band(60) == "green"
        assert _band(100) == "green"

    def test_yellow(self):
        assert _band(35) == "yellow"
        assert _band(59) == "yellow"

    def test_red(self):
        assert _band(0) == "red"
        assert _band(34) == "red"

    def test_boundary_35(self):
        assert _band(35) == "yellow"

    def test_boundary_60(self):
        assert _band(60) == "green"
