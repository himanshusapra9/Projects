from __future__ import annotations

from pydantic import BaseModel, Field


class InsightCard(BaseModel):
    id: str = Field(default="")
    title: str = Field(..., min_length=1)
    signal_strength: float = Field(default=0.0, ge=0.0, le=100.0)
    trend_pct: float = Field(default=0.0)
    sentiment_label: str = Field(default="neutral")
    sentiment_avg: float = Field(default=0.0)
    source_summary: str = Field(default="")
    sample_quotes: list[str] = Field(default_factory=list)
    feedback_count: int = Field(default=0)
    topic: str = Field(default="")
    created_at: str = Field(default="")
