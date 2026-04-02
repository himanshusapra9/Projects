from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Incident(BaseModel):
    id: str = Field(default="")
    table_name: str = Field(default="")
    anomaly_type: str = Field(default="")
    severity: str = Field(default="P2")  # P0, P1, P2, P3
    description: str = Field(default="")
    expected_value: float = Field(default=0.0)
    actual_value: float = Field(default=0.0)
    pct_deviation: float = Field(default=0.0)
    root_cause: Optional[str] = None
    remediation_steps: list[str] = Field(default_factory=list)
    auto_healable: bool = Field(default=False)
    auto_heal_action: str = Field(default="alert_only")
    status: str = Field(default="open")  # open, investigating, resolved, false_positive
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    resolved_at: Optional[str] = None
