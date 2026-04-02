"""Tests for ml.embeddings with mocked SentenceTransformer."""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from ml.embeddings import deduplicate, encode


def _normalize_rows(arr: np.ndarray[Any, Any]) -> np.ndarray[Any, Any]:
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return arr / norms


@patch("ml.embeddings.get_encoder")
def test_encode_identical_strings_high_cosine_similarity(mock_get_encoder) -> None:
    v = np.array([[1.0, 0.0, 0.0], [1.0, 0.0, 0.0]])
    v = _normalize_rows(v)
    mock_model = MagicMock()
    mock_model.encode.return_value = v
    mock_get_encoder.return_value = mock_model

    out = encode(["same text", "same text"])
    sim = float(np.dot(out[0], out[1]))
    assert sim > 0.99


@patch("ml.embeddings.get_encoder")
def test_deduplicate_removes_near_duplicate(mock_get_encoder) -> None:
    # Three docs: first and third are near-duplicates (sim > 0.95)
    raw = np.array(
        [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.999, 0.001, 0.0],
        ]
    )
    emb = _normalize_rows(raw)
    mock_model = MagicMock()
    mock_model.encode.return_value = emb
    mock_get_encoder.return_value = mock_model

    docs = [
        {"text": "alpha"},
        {"text": "beta"},
        {"text": "alpha dup"},
    ]
    kept = deduplicate(docs, threshold=0.95)
    assert len(kept) == 2
