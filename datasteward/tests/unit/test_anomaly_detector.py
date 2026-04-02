"""Tests for anomaly detection — Prophet baseline + Isolation Forest."""
import numpy as np
import pandas as pd
import pytest
from backend.ml.anomaly_detector import AnomalyDetector


@pytest.fixture
def detector() -> AnomalyDetector:
    det = AnomalyDetector()
    np.random.seed(42)
    dates = pd.date_range("2024-01-01", periods=90, freq="D")
    values = 10000 + np.sin(np.arange(90) * 2 * np.pi / 7) * 500 + np.random.normal(0, 100, 90)
    history = pd.DataFrame({"ds": dates, "y": values})
    det.fit_baseline("orders", history)
    return det


def test_normal_value_no_anomaly(detector: AnomalyDetector):
    result = detector.detect_row_count_anomaly("orders", 10000)
    assert result["anomaly"] is False


def test_70_percent_drop_detected(detector: AnomalyDetector):
    result = detector.detect_row_count_anomaly("orders", 3000)
    assert result["anomaly"] is True
    assert result["anomaly_type"] == "row_count_drop"
    assert result["pct_deviation"] > 50


def test_spike_detected(detector: AnomalyDetector):
    result = detector.detect_row_count_anomaly("orders", 25000)
    assert result["anomaly"] is True
    assert result["anomaly_type"] == "row_count_spike"


def test_unknown_table_no_baseline():
    det = AnomalyDetector()
    result = det.detect_row_count_anomaly("unknown_table", 1000)
    assert result["anomaly"] is False
    assert result["reason"] == "no_baseline"


def test_isolation_forest_normal():
    det = AnomalyDetector()
    np.random.seed(42)
    normal_data = np.column_stack([
        np.random.normal(100, 10, 200),
        np.random.normal(0.05, 0.01, 200),
        np.random.normal(50, 5, 200),
    ])
    det.fit_isolation_forest(normal_data)
    result = det.detect_multivariate_anomaly({"row_count": 100, "null_rate": 0.05, "avg": 50})
    assert result["anomaly"] is False


def test_isolation_forest_outlier():
    det = AnomalyDetector()
    np.random.seed(42)
    normal_data = np.column_stack([
        np.random.normal(100, 10, 200),
        np.random.normal(0.05, 0.01, 200),
        np.random.normal(50, 5, 200),
    ])
    det.fit_isolation_forest(normal_data)
    result = det.detect_multivariate_anomaly({"row_count": 500, "null_rate": 0.8, "avg": 200})
    assert result["anomaly"] is True


def test_isolation_forest_not_fitted():
    det = AnomalyDetector()
    result = det.detect_multivariate_anomaly({"x": 1})
    assert result["anomaly"] is False
    assert result["reason"] == "not_fitted"
