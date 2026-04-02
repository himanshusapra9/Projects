from __future__ import annotations

import sqlite3
import json
from pathlib import Path
from models.experiment import ExperimentResult


class MemoryEngine:
    def __init__(self, db_path: str):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        conn = sqlite3.connect(str(self.db_path))
        conn.execute("""
            CREATE TABLE IF NOT EXISTS experiments (
                exp_id TEXT PRIMARY KEY,
                status TEXT,
                decision TEXT,
                val_loss REAL,
                duration_seconds REAL,
                commit_hash TEXT,
                proposal_json TEXT,
                metrics_json TEXT,
                safety_flags TEXT,
                timestamp TEXT
            )
        """)
        conn.commit()
        conn.close()

    def save(self, result: ExperimentResult) -> None:
        conn = sqlite3.connect(str(self.db_path))
        try:
            conn.execute(
                """INSERT OR REPLACE INTO experiments
                   (exp_id, status, decision, val_loss, duration_seconds,
                    commit_hash, proposal_json, metrics_json, safety_flags, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    result.exp_id,
                    result.status,
                    result.decision,
                    result.metrics.val_loss if result.metrics else None,
                    result.duration_seconds,
                    result.commit_hash,
                    result.proposal.model_dump_json() if result.proposal else None,
                    result.metrics.model_dump_json() if result.metrics else None,
                    json.dumps(result.safety_flags),
                    result.timestamp,
                ),
            )
            conn.commit()
        finally:
            conn.close()

    def load_all(self) -> list[dict]:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM experiments ORDER BY timestamp").fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def get_best(self) -> dict | None:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM experiments WHERE decision='kept' ORDER BY val_loss ASC LIMIT 1"
        ).fetchone()
        conn.close()
        return dict(row) if row else None
