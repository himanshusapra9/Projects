"""Tests for distribution drift detection via KS-test."""
import numpy as np
import pytest
from backend.ml.drift_detector import DriftDetector


@pytest.fixture
def detector() -> DriftDetector:
    return DriftDetector()


def test_same_distribution_no_drift(detector: DriftDetector):
    np.random.seed(42)
    baseline = np.random.normal(100, 10, 500)
    current = np.random.normal(100, 10, 500)
    result = detector.detect_distribution_drift(baseline, current)
    assert result["drift_detected"] is False
    assert result["p_value"] > 0.05


def test_shifted_distribution_drift_detected(detector: DriftDetector):
    np.random.seed(42)
    baseline = np.random.normal(100, 10, 500)
    current = np.random.normal(120, 10, 500)
    result = detector.detect_distribution_drift(baseline, current)
    assert result["drift_detected"] is True
    assert result["p_value"] < 0.05


def test_variance_change_detected(detector: DriftDetector):
    np.random.seed(42)
    baseline = np.random.normal(100, 10, 500)
    current = np.random.normal(100, 50, 500)
    result = detector.detect_distribution_drift(baseline, current)
    assert result["drift_detected"] is True


def test_insufficient_data(detector: DriftDetector):
    result = detector.detect_distribution_drift(np.array([1, 2]), np.array([3, 4]))
    assert result["drift_detected"] is False
    assert result["reason"] == "insufficient_data"


def test_result_contains_stats(detector: DriftDetector):
    np.random.seed(42)
    baseline = np.random.normal(100, 10, 100)
    current = np.random.normal(100, 10, 100)
    result = detector.detect_distribution_drift(baseline, current)
    assert "ks_statistic" in result
    assert "p_value" in result
    assert "baseline_mean" in result
    assert "current_mean" in result
