"""Tests for mock topic classification."""
import pytest
from backend.ml.topic_classifier import classify_topics_mock

LABELS = [
    "onboarding", "billing", "performance", "integrations", "mobile",
    "search", "notifications", "security", "pricing", "ui_ux", "support",
]


def test_billing_topic():
    topics = classify_topics_mock("My billing invoice was charged twice", LABELS)
    assert "billing" in topics


def test_performance_topic():
    topics = classify_topics_mock("The app is so slow, loading takes forever", LABELS)
    assert "performance" in topics


def test_security_topic():
    topics = classify_topics_mock("I need 2FA for my login password security", LABELS)
    assert "security" in topics


def test_mobile_topic():
    topics = classify_topics_mock("The iOS mobile app keeps crashing on my phone", LABELS)
    assert "mobile" in topics


def test_returns_at_least_one():
    topics = classify_topics_mock("Generic feedback about something", LABELS)
    assert len(topics) >= 1
