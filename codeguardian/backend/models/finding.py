from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional

class Finding(BaseModel):
    id: str = Field(default="")
    file: str = Field(default="")
    line: int = Field(default=0)
    severity: str = Field(default="LOW")  # CRITICAL, HIGH, MEDIUM, LOW
    cwe: str = Field(default="")
    title: str = Field(default="")
    description: str = Field(default="")
    evidence: str = Field(default="")
    suggestion: str = Field(default="")
    auto_fixable: bool = Field(default=False)
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    references: list[str] = Field(default_factory=list)
    source: str = Field(default="static")  # static, ml, business_logic, secret, dependency
