from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ExperimentProposal(BaseModel):
    hypothesis: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    unified_diff: str = Field(..., min_length=1)
    rationale: str = Field(default="")
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    estimated_val_loss: float = Field(default=0.0, ge=0.0)
    risks: list[str] = Field(default_factory=list)

    model_config = {"json_schema_extra": {"examples": [{"hypothesis": "Cosine annealing LR", "description": "Replace constant LR with cosine annealing", "unified_diff": "--- a/train.py\n+++ b/train.py", "confidence": 0.7}]}}


class ExperimentMetrics(BaseModel):
    val_loss: float = Field(default=float("inf"))
    train_loss: float = Field(default=float("inf"))
    tokens_per_second: float = Field(default=0.0)
    peak_gpu_memory_mb: float = Field(default=0.0)
    extra: dict = Field(default_factory=dict)


class ExperimentResult(BaseModel):
    exp_id: str = Field(..., min_length=1)
    proposal: Optional[ExperimentProposal] = None
    status: str = Field(default="pending")  # pending, running, completed, timeout, rejected
    decision: str = Field(default="pending")  # pending, kept, discarded
    metrics: Optional[ExperimentMetrics] = None
    duration_seconds: float = Field(default=0.0)
    commit_hash: Optional[str] = None
    safety_flags: list[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    log_output: str = Field(default="")
