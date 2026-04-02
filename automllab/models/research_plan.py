from __future__ import annotations

from pydantic import BaseModel, Field, field_validator
from typing import Literal


class Baseline(BaseModel):
    val_loss: float = Field(..., gt=0, description="Baseline validation loss")
    training_time_minutes: float = Field(..., gt=0)
    model_description: str = Field(..., min_length=1)

    model_config = {"json_schema_extra": {"examples": [{"val_loss": 0.862, "training_time_minutes": 4.2, "model_description": "GPT-style transformer, 6 layers"}]}}


class Constraints(BaseModel):
    max_gpu_memory_gb: int = Field(default=35, gt=0)
    max_experiment_minutes: int = Field(default=8, gt=0)
    max_total_hours: int = Field(default=8, gt=0)
    forbidden_files: list[str] = Field(default_factory=list)
    allowed_files: list[str] = Field(default_factory=list)


class Hypothesis(BaseModel):
    id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    priority: int = Field(default=1, ge=1, le=10)


class SuccessCriterion(BaseModel):
    metric: str = Field(..., min_length=1)
    target: float
    type: Literal["primary", "secondary"] = "primary"


class ResearchPlan(BaseModel):
    research_goal: str = Field(..., min_length=1)
    baseline: Baseline
    constraints: Constraints = Field(default_factory=Constraints)
    hypotheses: list[Hypothesis] = Field(default_factory=list, min_length=1)
    success_criteria: list[SuccessCriterion] = Field(default_factory=list, min_length=1)
    strategy: Literal["bayesian_adaptive", "grid", "random"] = "bayesian_adaptive"
    parallelism: int = Field(default=1, ge=1, le=8)
    checkpoint_frequency: Literal["every_improvement", "every_n", "never"] = "every_improvement"

    @field_validator("hypotheses")
    @classmethod
    def at_least_one_hypothesis(cls, v: list[Hypothesis]) -> list[Hypothesis]:
        if not v:
            raise ValueError("At least one hypothesis is required")
        return v
