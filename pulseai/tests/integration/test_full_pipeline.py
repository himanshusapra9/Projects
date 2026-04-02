"""Integration test: 50 mock feedback items through full pipeline."""
import pytest
from backend.models.feedback import FeedbackItem
from backend.processing.pipeline import process_feedback
from backend.processing.insight_card_builder import build_insight_cards
from backend.processing.briefing_generator import generate_daily_briefing_mock


FEEDBACK_TEXTS = [
    "The billing page is confusing and I was charged twice",
    "Love the new onboarding flow, very intuitive!",
    "App crashes every time I open notifications on mobile",
    "Search is incredibly slow, takes 10 seconds to load",
    "Please add Slack integration, we really need it",
    "Security concern: no 2FA option available",
    "The pricing page doesn't show annual plans",
    "Great customer support, resolved my issue quickly!",
    "Export feature is broken, CSV downloads are empty",
    "The mobile app UI needs a complete redesign",
    "I'm switching to competitor because performance is terrible",
    "Billing statement doesn't match what I was told",
    "Onboarding tutorial was very helpful",
    "Can't find the search button on mobile",
    "Notification emails are going to spam",
    "Need better API documentation",
    "The pricing is too expensive for small teams",
    "Amazing product, love the interface!",
    "Bug: clicking save does nothing on the settings page",
    "Please add dark mode to the mobile app",
] * 3  # 60 items


def test_full_pipeline_processes_all():
    items = [
        FeedbackItem(text=text, source_platform="test", id=f"fb_{i}")
        for i, text in enumerate(FEEDBACK_TEXTS[:50])
    ]

    processed = []
    for item in items:
        result = process_feedback(item)
        processed.append(result)

    assert len(processed) == 50
    for p in processed:
        assert p.sentiment_label in ("positive", "negative", "neutral")
        assert len(p.topics) >= 0
        assert 0.0 <= p.urgency_score <= 10.0


def test_insight_cards_generated():
    items = [
        FeedbackItem(text=text, source_platform="test", id=f"fb_{i}")
        for i, text in enumerate(FEEDBACK_TEXTS[:50])
    ]
    processed = [process_feedback(item) for item in items]

    cards = build_insight_cards(processed, min_cluster_size=3)
    assert len(cards) >= 1
    for card in cards:
        assert card.feedback_count >= 3
        assert card.title


def test_briefing_generated():
    items = [
        FeedbackItem(text=text, source_platform="test", id=f"fb_{i}")
        for i, text in enumerate(FEEDBACK_TEXTS[:50])
    ]
    processed = [process_feedback(item) for item in items]
    cards = build_insight_cards(processed, min_cluster_size=3)

    briefing = generate_daily_briefing_mock(cards)
    assert len(briefing) > 0
    assert "Daily Briefing" in briefing
