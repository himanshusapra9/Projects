from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, Any
from models.experiment import ExperimentResult


class Report(BaseModel):
    narrative: str = Field(default="")
    experiment_log: Any = None  # pd.DataFrame serialized
    best_result: Optional[ExperimentResult] = None
    total_experiments: int = Field(default=0)
    kept_experiments: int = Field(default=0)
    improvement_pct: float = Field(default=0.0)
