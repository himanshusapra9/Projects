from __future__ import annotations
from pydantic import BaseModel, Field

class RepoSecurityScore(BaseModel):
    repo: str = Field(default="")
    score: float = Field(default=100.0, ge=0.0, le=100.0)
    critical_findings: int = Field(default=0)
    high_findings: int = Field(default=0)
    last_scan: str = Field(default="")
    trend: str = Field(default="stable")  # improving, degrading, stable
