"""Integration test for profiler (uses in-memory data, no real Postgres)."""
import pytest
from datetime import datetime
from backend.monitoring.profiler import profile_table_from_data


def test_profile_1000_rows():
    rows = [
        {
            "id": i,
            "name": f"user_{i}",
            "email": f"user_{i}@test.com" if i % 10 != 0 else None,
            "amount": float(i * 10 + 5),
            "created_at": datetime(2024, 1, 1 + i % 28 + 1).isoformat(),
        }
        for i in range(1000)
    ]

    profile = profile_table_from_data(
        table_name="users",
        rows=rows,
        pk_col="id",
        ts_col="created_at",
        numeric_cols=["amount"],
        nullable_cols=["email"],
    )

    assert profile.row_count == 1000
    assert profile.distinct_pk_count == 1000
    assert profile.last_updated is not None
    assert profile.null_counts["email"] == 100  # every 10th is None
    assert "amount" in profile.numeric_stats
    assert profile.numeric_stats["amount"]["avg"] > 0


def test_profile_empty_table():
    profile = profile_table_from_data(
        table_name="empty_table",
        rows=[],
        pk_col="id",
        ts_col="created_at",
        numeric_cols=["amount"],
        nullable_cols=["name"],
    )
    assert profile.row_count == 0
    assert profile.distinct_pk_count == 0
