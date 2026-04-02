"""Tests for insight card builder."""
import pytest
from backend.models.feedback import FeedbackItem, ProcessedFeedback
from backend.processing.insight_card_builder import build_insight_cards


def _make_processed(text: str, topics: list[str], sentiment: float) -> ProcessedFeedback:
    return ProcessedFeedback(
        original=FeedbackItem(text=text, source_platform="test"),
        sentiment_label="positive" if sentiment > 0.3 else ("negative" if sentiment < -0.3 else "neutral"),
        sentiment_score=sentiment,
        topics=topics,
        pain_points=[],
        urgency_score=5.0,
    )


def test_cluster_20_similar_items():
    items = []
    for i in range(10):
        items.append(_make_processed(
            f"The billing page is confusing #{i}", ["billing"], -0.5
        ))
    for i in range(10):
        items.append(_make_processed(
            f"Great onboarding experience #{i}", ["onboarding"], 0.8
        ))

    cards = build_insight_cards(items, min_cluster_size=3)
    assert 1 <= len(cards) <= 3
    topics = [c.topic for c in cards]
    assert "billing" in topics
    assert "onboarding" in topics


def test_min_cluster_size_filters_small():
    items = [
        _make_processed("billing issue", ["billing"], -0.3),
        _make_processed("another billing issue", ["billing"], -0.5),
    ]
    cards = build_insight_cards(items, min_cluster_size=5)
    assert len(cards) == 0


def test_signal_strength_scales_with_count():
    items = [
        _make_processed(f"performance problem #{i}", ["performance"], -0.6)
        for i in range(15)
    ]
    cards = build_insight_cards(items, min_cluster_size=3)
    assert len(cards) == 1
    assert cards[0].signal_strength > 50.0


def test_cards_sorted_by_signal_strength():
    items = []
    for i in range(5):
        items.append(_make_processed(f"billing #{i}", ["billing"], -0.3))
    for i in range(12):
        items.append(_make_processed(f"performance #{i}", ["performance"], -0.7))

    cards = build_insight_cards(items, min_cluster_size=3)
    assert len(cards) >= 2
    assert cards[0].signal_strength >= cards[1].signal_strength
