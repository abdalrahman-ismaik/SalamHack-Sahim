"""Unit tests for halal screener AAOIFI fallback logic. T044"""

import pytest
from app.services.halal_screener import _aaoifi_classify, _sector_non_halal


class TestSectorNonHalal:
    def test_banking_sector(self):
        assert _sector_non_halal("banking") is True

    def test_alcohol(self):
        assert _sector_non_halal("alcohol") is True

    def test_gambling(self):
        assert _sector_non_halal("gambling") is True

    def test_weapons(self):
        assert _sector_non_halal("weapons") is True

    def test_technology_allowed(self):
        assert _sector_non_halal("Technology") is False

    def test_none_sector(self):
        assert _sector_non_halal(None) is False

    def test_case_insensitive(self):
        assert _sector_non_halal("Banking") is True


class TestAaaoifiClassify:
    def test_halal_clean_ratios(self):
        result = _aaoifi_classify("Technology", 0.20, 0.03)
        assert result == "Halal"

    def test_non_halal_high_debt(self):
        result = _aaoifi_classify("Technology", 0.60, 0.03)
        assert result == "NonHalal"

    def test_non_halal_high_interest(self):
        result = _aaoifi_classify("Technology", 0.20, 0.15)
        assert result == "NonHalal"

    def test_purification_required_debt_in_range(self):
        result = _aaoifi_classify("Technology", 0.40, 0.03)
        assert result == "PurificationRequired"

    def test_purification_required_interest_in_range(self):
        result = _aaoifi_classify("Technology", 0.20, 0.07)
        assert result == "PurificationRequired"

    def test_sector_override_non_halal(self):
        # Even with clean ratios, banking sector → NonHalal
        result = _aaoifi_classify("banking", 0.10, 0.01)
        assert result == "NonHalal"

    def test_only_debt_ratio_halal(self):
        result = _aaoifi_classify(None, 0.10, None)
        assert result == "Halal"

    def test_only_debt_ratio_non_halal(self):
        result = _aaoifi_classify(None, 0.60, None)
        assert result == "NonHalal"

    def test_no_data_unknown(self):
        result = _aaoifi_classify("Technology", None, None)
        assert result == "Unknown"
