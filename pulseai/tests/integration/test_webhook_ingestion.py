"""Integration tests for webhook ingestion."""
import pytest
from backend.ingestion.webhook_handlers import parse_intercom_webhook, parse_zendesk_webhook
from backend.models.feedback import FeedbackItem


def test_intercom_webhook_parsed():
    payload = {
        "data": {
            "item": {
                "id": "conv_123",
                "body": "I need help with my account settings",
                "type": "conversation",
                "user": {"id": "user_456", "name": "John Doe"},
                "tags": ["support"],
            }
        }
    }
    item = parse_intercom_webhook(payload)
    assert item is not None
    assert isinstance(item, FeedbackItem)
    assert item.source_platform == "intercom"
    assert "account settings" in item.text
    assert item.author_name == "John Doe"


def test_intercom_webhook_empty_body():
    payload = {"data": {"item": {"id": "conv_123", "body": ""}}}
    item = parse_intercom_webhook(payload)
    assert item is None


def test_zendesk_webhook_parsed():
    payload = {
        "ticket": {
            "id": 789,
            "description": "Login page returns 500 error",
            "subject": "Cannot login",
            "requester_id": 111,
            "priority": "high",
            "status": "open",
        }
    }
    item = parse_zendesk_webhook(payload)
    assert item is not None
    assert item.source_platform == "zendesk"
    assert "500 error" in item.text
