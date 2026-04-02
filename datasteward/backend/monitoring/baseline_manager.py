from __future__ import annotations

import json
from pathlib import Path
from datetime import datetime


class BaselineManager:
    def __init__(self, storage_path: str = ".datasteward/baselines"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.baselines: dict[str, dict] = {}

    def store_baseline(self, table_name: str, metrics: dict) -> None:
        self.baselines[table_name] = {
            "metrics": metrics,
            "updated_at": datetime.utcnow().isoformat(),
        }
        path = self.storage_path / f"{table_name}.json"
        path.write_text(json.dumps(self.baselines[table_name], indent=2))

    def get_baseline(self, table_name: str) -> dict | None:
        if table_name in self.baselines:
            return self.baselines[table_name]["metrics"]
        path = self.storage_path / f"{table_name}.json"
        if path.exists():
            data = json.loads(path.read_text())
            self.baselines[table_name] = data
            return data["metrics"]
        return None
