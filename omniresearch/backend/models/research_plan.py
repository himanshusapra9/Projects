from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ResearchDepth(str, Enum):
    quick = "quick"
    standard = "standard"
    deep = "deep"


class SourceType(str, Enum):
    academic = "academic"
    web = "web"
    video = "video"
    audio = "audio"
    social = "social"
    news = "news"
    github = "github"
    datasets = "datasets"


class SubQuery(BaseModel):
    query: str = Field(..., description="Decomposed sub-query text")
    target_sources: list[SourceType] = Field(default_factory=list)
    priority: int = Field(default=1, ge=1, le=5)


class ResearchPlan(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "original_query": "Impact of transformer models on NLP",
                "sub_queries": [
                    {
                        "query": "transformer architecture advances 2023-2024",
                        "target_sources": ["academic"],
                        "priority": 1,
                    }
                ],
                "depth": "standard",
                "estimated_time_seconds": 480,
            }
        }
    )

    original_query: str
    sub_queries: list[SubQuery] = Field(default_factory=list)
    depth: ResearchDepth = ResearchDepth.standard
    estimated_time_seconds: int = 480


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2000, description="Research query")
    depth: ResearchDepth = Field(default=ResearchDepth.standard)
    sources: list[SourceType] = Field(default_factory=lambda: list(SourceType))
    max_results_per_source: int = Field(default=20, ge=1, le=100)
