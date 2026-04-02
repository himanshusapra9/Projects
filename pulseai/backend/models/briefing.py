from __future__ import annotations
from pydantic import BaseModel, Field

class DailyBriefing(BaseModel):
    date: str = Field(...)
    narrative: str = Field(default="")
    urgent_signals: list[dict] = Field(default_factory=list)
    emerging_trends: list[dict] = Field(default_factory=list)
    churn_risks: list[dict] = Field(default_factory=list)
    recommendation: str = Field(default="")
