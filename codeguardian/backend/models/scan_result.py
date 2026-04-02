from __future__ import annotations
from pydantic import BaseModel, Field
from backend.models.finding import Finding

class ScanResult(BaseModel):
    repo: str = Field(default="")
    commit_sha: str = Field(default="")
    pr_number: int = Field(default=0)
    findings: list[Finding] = Field(default_factory=list)
    scan_duration_seconds: float = Field(default=0.0)
    critical_count: int = Field(default=0)
    high_count: int = Field(default=0)
    medium_count: int = Field(default=0)
    low_count: int = Field(default=0)
    
    def compute_counts(self) -> None:
        self.critical_count = sum(1 for f in self.findings if f.severity == "CRITICAL")
        self.high_count = sum(1 for f in self.findings if f.severity == "HIGH")
        self.medium_count = sum(1 for f in self.findings if f.severity == "MEDIUM")
        self.low_count = sum(1 for f in self.findings if f.severity == "LOW")
