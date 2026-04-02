"""Tests for pipeline freshness prediction."""
import pytest
from backend.ml.freshness_predictor import FreshnessPredictor


def test_predict_with_history():
    pred = FreshnessPredictor()
    for t in [300, 310, 295, 305, 300, 298, 302]:
        pred.add_completion_time(t)

    result = pred.predict_next()
    assert result["predicted_seconds"] > 0
    assert result["confidence"] > 0.5


def test_predict_insufficient_history():
    pred = FreshnessPredictor()
    pred.add_completion_time(300)
    result = pred.predict_next()
    assert result["predicted_seconds"] == 0
    assert result["confidence"] == 0


def test_is_late_true():
    pred = FreshnessPredictor()
    for t in [300, 310, 295, 305, 300, 298, 302]:
        pred.add_completion_time(t)
    assert pred.is_late(600) is True


def test_is_late_false():
    pred = FreshnessPredictor()
    for t in [300, 310, 295, 305, 300, 298, 302]:
        pred.add_completion_time(t)
    assert pred.is_late(305) is False


def test_is_late_insufficient_history():
    pred = FreshnessPredictor()
    assert pred.is_late(1000) is False
