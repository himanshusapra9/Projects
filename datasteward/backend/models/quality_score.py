from __future__ import annotations
from pydantic import BaseModel, Field

class QualityScore(BaseModel):
    table_name: str = Field(..., min_length=1)
    overall_score: float = Field(default=100.0, ge=0.0, le=100.0)
    completeness: float = Field(default=100.0, ge=0.0, le=100.0)
    freshness: float = Field(default=100.0, ge=0.0, le=100.0)
    uniqueness: float = Field(default=100.0, ge=0.0, le=100.0)
    consistency: float = Field(default=100.0, ge=0.0, le=100.0)
    open_incidents: int = Field(default=0)
    
    def compute_overall(self) -> None:
        weights = {"completeness": 0.3, "freshness": 0.3, "uniqueness": 0.2, "consistency": 0.2}
        self.overall_score = round(
            self.completeness * weights["completeness"] +
            self.freshness * weights["freshness"] +
            self.uniqueness * weights["uniqueness"] +
            self.consistency * weights["consistency"],
            1
        )
