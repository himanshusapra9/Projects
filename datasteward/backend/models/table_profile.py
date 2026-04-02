from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TableProfile(BaseModel):
    table_name: str = Field(..., min_length=1)
    profiled_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    row_count: int = Field(default=0, ge=0)
    distinct_pk_count: int = Field(default=0, ge=0)
    last_updated: Optional[str] = None
    null_counts: dict[str, int] = Field(default_factory=dict)
    numeric_stats: dict[str, dict] = Field(default_factory=dict)
    raw_metrics: dict = Field(default_factory=dict)
    staleness_seconds: float = Field(default=0.0)
