from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FeedbackItem(BaseModel):
    id: str = Field(default="")
    text: str = Field(..., min_length=1)
    source_platform: str = Field(default="unknown")
    author_id: str = Field(default="")
    author_name: str = Field(default="")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: dict = Field(default_factory=dict)
    
    model_config = {"json_schema_extra": {"examples": [{"text": "This product is amazing!", "source_platform": "intercom"}]}}

class ProcessedFeedback(BaseModel):
    original: FeedbackItem
    sentiment_label: str = Field(default="neutral")
    sentiment_score: float = Field(default=0.0)
    topics: list[str] = Field(default_factory=list)
    pain_points: list[dict] = Field(default_factory=list)
    urgency_score: float = Field(default=0.0, ge=0.0, le=10.0)
    processed_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
