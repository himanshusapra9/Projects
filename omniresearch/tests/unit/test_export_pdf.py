"""Tests for generate_pdf in agents.export_generator."""

from __future__ import annotations

from agents.export_generator import generate_pdf


def test_generate_pdf_returns_valid_pdf_bytes() -> None:
    data = generate_pdf("Line one.\nLine two.", "test query")
    assert isinstance(data, bytes)
    assert len(data) > 0
    assert data.startswith(b"%PDF")
