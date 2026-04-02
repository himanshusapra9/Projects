"""Tests for urgency scoring."""
import pytest
from backend.ml.urgency_scorer import score_urgency


def test_high_urgency_negative_churn():
    score = score_urgency({
        "sentiment_score": -1.0,
        "all_caps_ratio": 0.5,
        "exclamation_count": 5,
        "churn_keywords": 1,
        "text_length": 200,
    })
    assert score > 7.0, f"Expected high urgency, got {score}"


def test_low_urgency_neutral():
    score = score_urgency({
        "sentiment_score": 0.0,
        "all_caps_ratio": 0.0,
        "exclamation_count": 0,
        "churn_keywords": 0,
        "text_length": 50,
    })
    assert score < 6.0, f"Expected low urgency, got {score}"


def test_very_high_urgency_all_caps_churn():
    score = score_urgency({
        "sentiment_score": -1.0,
        "all_caps_ratio": 0.8,
        "exclamation_count": 10,
        "churn_keywords": 1,
        "text_length": 300,
    })
    assert score >= 8.0


def test_positive_sentiment_low_urgency():
    score = score_urgency({
        "sentiment_score": 1.0,
        "all_caps_ratio": 0.0,
        "exclamation_count": 0,
        "churn_keywords": 0,
        "text_length": 30,
    })
    assert score < 4.0


def test_urgency_clamped_0_to_10():
    score_low = score_urgency({
        "sentiment_score": 5.0,
        "all_caps_ratio": 0.0,
        "exclamation_count": 0,
        "churn_keywords": 0,
        "text_length": 0,
    })
    assert 0.0 <= score_low <= 10.0

    score_high = score_urgency({
        "sentiment_score": -5.0,
        "all_caps_ratio": 1.0,
        "exclamation_count": 20,
        "churn_keywords": 1,
        "text_length": 1000,
    })
    assert 0.0 <= score_high <= 10.0
