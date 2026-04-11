"""Deterministic synthetic data for demo mode — 3 tables, 30 days, 3 anomalies."""
from __future__ import annotations

import random
from datetime import datetime, timedelta

random.seed(42)

_BASE_DATE = datetime(2025, 3, 1)


def _daily_dates(n: int = 30) -> list[str]:
    return [(_BASE_DATE + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(n)]


def _row_counts(base: int, std: int, n: int = 30) -> list[int]:
    rng = random.Random(42)
    return [max(0, int(base + rng.gauss(0, std))) for _ in range(n)]


def _inject_anomaly(counts: list[int], day: int, factor: float) -> list[int]:
    counts = list(counts)
    counts[day] = int(counts[day] * factor)
    return counts


def generate_tables() -> list[dict]:
    orders_counts = _row_counts(45000, 1200)
    orders_counts = _inject_anomaly(orders_counts, 14, 0.3)  # day 15: drop

    users_counts = _row_counts(12000, 400)
    # day 22: schema drift (no row-count anomaly but drift flagged)

    events_counts = _row_counts(180000, 5000)
    events_counts = _inject_anomaly(events_counts, 27, 1.8)  # day 28: spike (duplicates)

    dates = _daily_dates()

    def _mean(lst: list[int]) -> float:
        return sum(lst) / len(lst)

    def _std(lst: list[int]) -> float:
        m = _mean(lst)
        return (sum((x - m) ** 2 for x in lst) / len(lst)) ** 0.5

    def _build_history(counts: list[int]) -> list[dict]:
        m = _mean(counts)
        s = _std(counts)
        return [
            {
                "date": dates[i],
                "count": counts[i],
                "baseline_mean": round(m),
                "baseline_upper": round(m + 2.5 * s),
                "baseline_lower": round(m + (-2.5 * s) if m + (-2.5 * s) > 0 else 0),
                "is_anomaly": counts[i] < m - 2.5 * s or counts[i] > m + 2.5 * s,
            }
            for i in range(len(counts))
        ]

    def _health(counts: list[int]) -> str:
        m = _mean(counts)
        s = _std(counts)
        latest = counts[-1]
        if latest < m - 2.5 * s or latest > m + 2.5 * s:
            return "critical"
        normal_counts = [c for c in counts if m - 2.5 * s <= c <= m + 2.5 * s]
        if len(normal_counts) < len(counts) - 2:
            return "warning"
        return "healthy"

    return [
        {
            "id": "tbl_orders",
            "name": "public.orders",
            "connection_string": "demo://localhost/analytics",
            "schedule_cron": "*/15 * * * *",
            "row_count": orders_counts[-1],
            "last_profiled": dates[-1] + "T08:00:00Z",
            "health": "warning",
            "drift_status": "OK",
            "history": _build_history(orders_counts),
            "column_stats": [
                {"column": "id", "type": "bigint", "null_pct": 0.0, "unique_count": orders_counts[-1], "min": "1", "max": str(orders_counts[-1]), "mean": "—"},
                {"column": "customer_id", "type": "bigint", "null_pct": 0.2, "unique_count": 8420, "min": "1", "max": "9999", "mean": "—"},
                {"column": "amount", "type": "numeric(10,2)", "null_pct": 0.0, "unique_count": 3215, "min": "0.50", "max": "4999.99", "mean": "127.43"},
                {"column": "status", "type": "varchar(20)", "null_pct": 0.0, "unique_count": 5, "min": "—", "max": "—", "mean": "—"},
                {"column": "created_at", "type": "timestamptz", "null_pct": 0.0, "unique_count": orders_counts[-1], "min": "2024-01-01", "max": "2025-03-30", "mean": "—"},
            ],
            "drift_results": [
                {"column": "amount", "ks_statistic": 0.031, "p_value": 0.72, "status": "OK"},
                {"column": "customer_id", "ks_statistic": 0.028, "p_value": 0.81, "status": "OK"},
            ],
            "anomalies": [
                {
                    "id": "anom_001",
                    "timestamp": dates[14] + "T08:15:00Z",
                    "type": "row_count_drop",
                    "description": f"Row count dropped to {orders_counts[14]} (expected ~45000). 70% decrease from baseline.",
                    "severity": "critical",
                },
            ],
            "duplicates": [],
        },
        {
            "id": "tbl_users",
            "name": "public.users",
            "connection_string": "demo://localhost/analytics",
            "schedule_cron": "0 * * * *",
            "row_count": users_counts[-1],
            "last_profiled": dates[-1] + "T08:00:00Z",
            "health": "warning",
            "drift_status": "Drift",
            "history": _build_history(users_counts),
            "column_stats": [
                {"column": "id", "type": "bigint", "null_pct": 0.0, "unique_count": users_counts[-1], "min": "1", "max": str(users_counts[-1]), "mean": "—"},
                {"column": "email", "type": "varchar(255)", "null_pct": 1.2, "unique_count": users_counts[-1] - 14, "min": "—", "max": "—", "mean": "—"},
                {"column": "signup_source", "type": "varchar(50)", "null_pct": 0.0, "unique_count": 6, "min": "—", "max": "—", "mean": "—"},
                {"column": "lifetime_value", "type": "numeric(10,2)", "null_pct": 5.3, "unique_count": 4200, "min": "0.00", "max": "25000.00", "mean": "342.18"},
                {"column": "created_at", "type": "timestamptz", "null_pct": 0.0, "unique_count": users_counts[-1], "min": "2023-06-01", "max": "2025-03-30", "mean": "—"},
            ],
            "drift_results": [
                {"column": "lifetime_value", "ks_statistic": 0.187, "p_value": 0.003, "status": "Drift"},
                {"column": "email", "ks_statistic": 0.022, "p_value": 0.91, "status": "OK"},
            ],
            "anomalies": [
                {
                    "id": "anom_002",
                    "timestamp": dates[21] + "T12:30:00Z",
                    "type": "schema_drift",
                    "description": "Column 'signup_source' type changed from varchar(30) to varchar(50). Distribution of lifetime_value shifted (KS p=0.003).",
                    "severity": "high",
                },
            ],
            "duplicates": [],
        },
        {
            "id": "tbl_events",
            "name": "public.events",
            "connection_string": "demo://localhost/analytics",
            "schedule_cron": "*/15 * * * *",
            "row_count": events_counts[-1],
            "last_profiled": dates[-1] + "T08:00:00Z",
            "health": "critical",
            "drift_status": "OK",
            "history": _build_history(events_counts),
            "column_stats": [
                {"column": "id", "type": "uuid", "null_pct": 0.0, "unique_count": events_counts[-1], "min": "—", "max": "—", "mean": "—"},
                {"column": "event_type", "type": "varchar(100)", "null_pct": 0.0, "unique_count": 24, "min": "—", "max": "—", "mean": "—"},
                {"column": "user_id", "type": "bigint", "null_pct": 3.1, "unique_count": 9800, "min": "1", "max": "12000", "mean": "—"},
                {"column": "payload", "type": "jsonb", "null_pct": 0.5, "unique_count": events_counts[-1] - 200, "min": "—", "max": "—", "mean": "—"},
                {"column": "created_at", "type": "timestamptz", "null_pct": 0.0, "unique_count": events_counts[-1], "min": "2024-06-01", "max": "2025-03-30", "mean": "—"},
            ],
            "drift_results": [
                {"column": "user_id", "ks_statistic": 0.045, "p_value": 0.38, "status": "OK"},
            ],
            "anomalies": [
                {
                    "id": "anom_003",
                    "timestamp": dates[27] + "T08:15:00Z",
                    "type": "duplicate_spike",
                    "description": f"Row count spiked to {events_counts[27]} (expected ~180000). Duplicate detection found 14,200 near-duplicate event records.",
                    "severity": "critical",
                },
            ],
            "duplicates": [
                {
                    "cluster_id": "dup_c1",
                    "records": [
                        {"id": "evt_90001", "event_type": "page_view", "user_id": "4521", "created_at": "2025-03-28T02:14:00Z"},
                        {"id": "evt_90002", "event_type": "page_view", "user_id": "4521", "created_at": "2025-03-28T02:14:01Z"},
                    ],
                },
                {
                    "cluster_id": "dup_c2",
                    "records": [
                        {"id": "evt_91010", "event_type": "purchase", "user_id": "7832", "created_at": "2025-03-28T03:22:00Z"},
                        {"id": "evt_91011", "event_type": "purchase", "user_id": "7832", "created_at": "2025-03-28T03:22:00Z"},
                        {"id": "evt_91012", "event_type": "purchase", "user_id": "7832", "created_at": "2025-03-28T03:22:01Z"},
                    ],
                },
            ],
        },
    ]


def generate_incidents() -> list[dict]:
    return [
        {
            "id": "inc_demo_001",
            "title": "Row count anomaly — orders table",
            "table_name": "public.orders",
            "table_id": "tbl_orders",
            "anomaly_type": "row_count_drop",
            "severity": "critical",
            "status": "open",
            "description": "Row count dropped 70% from baseline on 2025-03-15. Expected ~45,000 rows, received ~13,500.",
            "created_at": "2025-03-15T08:22:00Z",
            "linked_anomalies": ["anom_001"],
            "root_cause": (
                "**Most likely cause:** The ETL job for `orders_raw` ran at 03:14 UTC but the "
                "upstream API pagination changed, returning only page 1 of 12.\n\n"
                "**Evidence:**\n"
                "- Row count dropped from ~45,000 to ~13,500 (70% decrease)\n"
                "- The drop aligns with the 03:14 UTC ETL window\n"
                "- API response `total_pages` header shows 12, but only page 1 was fetched\n\n"
                "**Recommendation:**\n"
                "1. Check the API response at 03:14 UTC — verify `total_count` header matches ingested rows\n"
                "2. The pagination logic in `extract_orders.py:fetch_all_pages()` likely broke when the API "
                "started returning `next_cursor` instead of `next_page`\n"
                "3. Re-run the ETL job after fixing the pagination handler\n"
                "4. Add a post-load row count assertion to prevent silent partial loads"
            ),
        },
        {
            "id": "inc_demo_002",
            "title": "Duplicate spike — events table",
            "table_name": "public.events",
            "table_id": "tbl_events",
            "anomaly_type": "duplicate_spike",
            "severity": "high",
            "status": "open",
            "description": "14,200 near-duplicate event records detected on 2025-03-28. Row count spiked 80% above baseline.",
            "created_at": "2025-03-28T08:30:00Z",
            "linked_anomalies": ["anom_003"],
            "root_cause": (
                "**Most likely cause:** The Kafka consumer for the `events` topic processed a batch twice "
                "due to a consumer group rebalance during deployment at 02:00 UTC.\n\n"
                "**Evidence:**\n"
                "- 14,200 near-duplicate records with timestamps within 1 second of each other\n"
                "- Consumer lag spike visible in Kafka metrics at 02:00-02:15 UTC\n"
                "- The duplicates all share `event_type` and `user_id` with only `id` and sub-second "
                "`created_at` differences\n\n"
                "**Recommendation:**\n"
                "1. Deduplicate the affected partition using the `(event_type, user_id, created_at::date)` "
                "composite key\n"
                "2. Add idempotency keys to the event producer\n"
                "3. Consider enabling exactly-once semantics (EOS) on the Kafka consumer"
            ),
        },
    ]
