"""Export route smoke tests via FastAPI TestClient."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient

from main import app


def test_all_export_formats_return_200() -> None:
    client = TestClient(app)
    tid = str(uuid.uuid4())
    for fmt in ("csv", "pdf", "json", "markdown"):
        r = client.get(f"/api/v1/research/{tid}/export/{fmt}")
        assert r.status_code == 200, f"format={fmt} body={r.text[:200]}"
