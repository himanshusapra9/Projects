"""Tests for anomaly detection with Isolation Forest."""
import numpy as np
import pytest
from backend.ml.anomaly_detector import FeedbackAnomalyDetector


@pytest.fixture
def detector() -> FeedbackAnomalyDetector:
    det = FeedbackAnomalyDetector(contamination=0.05)
    np.random.seed(42)
    normal_data = np.column_stack([
        np.random.normal(100, 10, 200),    # volume
        np.random.normal(0.3, 0.1, 200),   # avg_sentiment
        np.random.normal(4.0, 0.5, 200),   # urgency_mean
    ])
    det.fit(normal_data)
    return det


def test_normal_metrics_no_anomaly(detector: FeedbackAnomalyDetector):
    normal = np.array([100.0, 0.3, 4.0])
    result = detector.detect(normal)
    assert result["anomaly"] is False


def test_spike_in_negative_sentiment(detector: FeedbackAnomalyDetector):
    anomalous = np.array([100.0, -2.0, 9.0])
    result = detector.detect(anomalous)
    assert result["anomaly"] is True
    assert result["anomaly_score"] > 0


def test_volume_spike(detector: FeedbackAnomalyDetector):
    anomalous = np.array([500.0, 0.3, 4.0])
    result = detector.detect(anomalous)
    assert result["anomaly"] is True


def test_not_fitted_returns_no_anomaly():
    det = FeedbackAnomalyDetector()
    result = det.detect(np.array([100.0, 0.3, 4.0]))
    assert result["anomaly"] is False
    assert result["reason"] == "not_fitted"
