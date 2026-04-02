"""Integration test for research API (requires ANTHROPIC_API_KEY when enabled)."""

from __future__ import annotations

import os
import uuid

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.mark.skipif(
    not os.environ.get("ANTHROPIC_API_KEY"),
    reason="No API keys",
)
def test_start_research_returns_202_and_task_id() -> None:
    client = TestClient(app)
    payload = {
        "query": "Impact of transformer models on NLP research",
        "depth": "quick",
        "sources": ["academic", "web"],
        "max_results_per_source": 5,
    }
    r = client.post("/api/v1/research", json=payload)
    assert r.status_code == 202
    body = r.json()
    assert "task_id" in body
    assert uuid.UUID(body["task_id"])  # valid UUID string


def test_health_without_api_key() -> None:
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"
