"""Tests for mock sentiment analysis."""
import pytest
from backend.ml.sentiment import analyze_sentiment_mock


def test_positive_sentiment():
    result = analyze_sentiment_mock("This product is amazing!")
    assert result["label"] == "positive"
    assert result["polarity"] > 0.7


def test_negative_sentiment():
    result = analyze_sentiment_mock("This is completely broken and I'm canceling")
    assert result["label"] == "negative"
    assert result["polarity"] < -0.7


def test_neutral_sentiment():
    result = analyze_sentiment_mock("It rained today")
    assert result["label"] == "neutral"
    assert result["polarity"] == 0.0


def test_strong_positive():
    result = analyze_sentiment_mock("Absolutely fantastic! I love this amazing product!")
    assert result["label"] == "positive"
    assert result["score"] > 0.5


def test_strong_negative():
    result = analyze_sentiment_mock("Terrible bug, awful crash, worst experience ever")
    assert result["label"] == "negative"
    assert result["score"] > 0.5
