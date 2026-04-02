"""Direct tests for ml.credibility.score_credibility (no ML deps)."""

from __future__ import annotations

import math

import pytest

from ml.credibility import score_credibility


def test_academic_zero_citations() -> None:
    assert score_credibility({"source_type": "academic", "citation_count": 0}) == 0.0


def test_academic_high_citations_caps_at_one() -> None:
    # log(c+1)/10 >= 1 when c is large enough; use value that hits the cap
    c = 1_000_000
    expected = min(1.0, math.log(c + 1) / 10)
    assert expected == 1.0
    assert score_credibility({"source_type": "academic", "citation_count": c}) == 1.0


def test_academic_1000_citations_matches_formula() -> None:
    c = 1000
    expected = min(1.0, math.log(c + 1) / 10)
    assert score_credibility({"source_type": "academic", "citation_count": c}) == pytest.approx(
        expected
    )


def test_social_high_engagement_positive() -> None:
    doc = {
        "source_type": "social",
        "score": 500,
        "num_comments": 500,
    }
    assert score_credibility(doc) == 1.0


def test_video_high_views_strong_score() -> None:
    doc = {"source_type": "video", "views": 10_000_000}
    s = score_credibility(doc)
    assert s > 0.5
    assert s <= 1.0


def test_news_fixed_score() -> None:
    assert score_credibility({"source_type": "news"}) == 0.6


def test_unknown_source_type_default() -> None:
    assert score_credibility({"source_type": "web"}) == 0.4
