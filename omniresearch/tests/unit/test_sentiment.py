"""Tests for ml.sentiment.analyze_sentiment with mocked pipeline."""

from __future__ import annotations

from unittest.mock import patch

from ml.sentiment import analyze_sentiment


def _mock_pipe_factory():
    def pipe(text: str) -> list[dict]:
        t = text.strip().lower()
        if "great" in t:
            return [{"label": "positive", "score": 0.99}]
        if "terrible" in t:
            return [{"label": "negative", "score": 0.97}]
        return [{"label": "neutral", "score": 0.85}]

    return pipe


@patch("ml.sentiment.get_sentiment_pipeline")
def test_sentiment_positive(mock_get_pipe) -> None:
    mock_get_pipe.return_value = _mock_pipe_factory()
    out = analyze_sentiment("This is great!")
    assert out["label"] == "positive"


@patch("ml.sentiment.get_sentiment_pipeline")
def test_sentiment_negative(mock_get_pipe) -> None:
    mock_get_pipe.return_value = _mock_pipe_factory()
    out = analyze_sentiment("This is terrible")
    assert out["label"] == "negative"


@patch("ml.sentiment.get_sentiment_pipeline")
def test_sentiment_neutral(mock_get_pipe) -> None:
    mock_get_pipe.return_value = _mock_pipe_factory()
    out = analyze_sentiment("It rained today")
    assert out["label"] == "neutral"
