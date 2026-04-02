from __future__ import annotations

from datetime import datetime
from typing import Any

from backend.models.table_profile import TableProfile


def profile_table_from_data(
    table_name: str,
    rows: list[dict],
    pk_col: str,
    ts_col: str,
    numeric_cols: list[str],
    nullable_cols: list[str],
) -> TableProfile:
    """Profile a table from in-memory data (for testing without a DB)."""
    row_count = len(rows)
    distinct_pk = len(set(r.get(pk_col, "") for r in rows))

    timestamps = [r.get(ts_col) for r in rows if r.get(ts_col)]
    last_updated = max(timestamps) if timestamps else None

    null_counts = {}
    for col in nullable_cols:
        null_counts[col] = sum(1 for r in rows if r.get(col) is None)

    numeric_stats: dict[str, dict[str, Any]] = {}
    for col in numeric_cols:
        values = [r.get(col) for r in rows if r.get(col) is not None]
        if values:
            numeric_stats[col] = {
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values),
                "count": len(values),
            }

    return TableProfile(
        table_name=table_name,
        profiled_at=datetime.utcnow().isoformat(),
        row_count=row_count,
        distinct_pk_count=distinct_pk,
        last_updated=str(last_updated) if last_updated else None,
        null_counts=null_counts,
        numeric_stats=numeric_stats,
        raw_metrics={"row_count": row_count, "distinct_pk_count": distinct_pk},
    )
