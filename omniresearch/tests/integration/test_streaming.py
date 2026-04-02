"""SSE streaming endpoint tests."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient

from main import app


def test_research_stream_content_type() -> None:
    client = TestClient(app)
    task_id = str(uuid.uuid4())
    response = client.get(f"/api/v1/research/{task_id}/stream")
    assert response.status_code == 200
    ct = response.headers.get("content-type", "")
    assert "text/event-stream" in ct
