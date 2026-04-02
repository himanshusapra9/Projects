"""Tests for generate_csv in agents.export_generator."""

from __future__ import annotations

import io

import pandas as pd

from agents.export_generator import generate_csv


REQUIRED_COLUMNS = [
    "insight_id",
    "insight_text",
    "source_type",
    "source_name",
    "source_url",
    "source_date",
    "author",
    "geographic_region",
    "data_type",
    "credibility_score",
    "sentiment_label",
    "sentiment_score",
    "relevance_score",
    "citation_count",
    "report_section",
    "query_timestamp",
    "research_depth",
    "sub_query_matched",
]


def _make_insight(suffix: str) -> dict:
    return {
        "id": f"id_{suffix}",
        "text": f"Insight text {suffix}",
        "source_type": "academic",
        "source_name": "OpenAlex",
        "url": f"https://example.com/{suffix}",
        "date": "2024-01-01",
        "author": f"Author {suffix}",
        "geographic_region": "North America",
        "data_type": "journal_article",
        "credibility_score": 0.8,
        "sentiment_label": "neutral",
        "sentiment_score": 0.1,
        "relevance_score": 0.9,
        "citation_count": 10,
        "report_section": "Findings",
        "research_depth": "standard",
        "sub_query_matched": "q1",
    }


def test_generate_csv_columns_and_rows() -> None:
    insights = [_make_insight("a"), _make_insight("b"), _make_insight("c")]
    raw = generate_csv(insights)
    df = pd.read_csv(io.BytesIO(raw))

    assert list(df.columns) == REQUIRED_COLUMNS
    assert len(df) == 3
    for col in ("insight_id", "source_type", "geographic_region"):
        assert df[col].notna().all()
