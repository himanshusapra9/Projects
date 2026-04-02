from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SourceDocument(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "doc_001",
                "title": "Attention Is All You Need",
                "source_type": "academic",
                "source_name": "arXiv",
                "url": "https://arxiv.org/abs/1706.03762",
            }
        }
    )

    id: str = Field(default="")
    title: str = Field(default="")
    text: str = Field(default="")
    abstract: str = Field(default="")
    transcript: str = Field(default="")
    url: str = Field(default="")
    source_type: str = Field(default="web")
    source_name: str = Field(default="")
    date: str = Field(default="")
    authors: list[str] = Field(default_factory=list)
    citation_count: int = Field(default=0)
    credibility_score: float = Field(default=0.0, ge=0.0, le=1.0)
    sentiment_label: str = Field(default="neutral")
    sentiment_score: float = Field(default=0.0)
    data_type: str = Field(default="text")
    geographic_region: str = Field(default="Global")
    relevance_score: float = Field(default=0.0)
    doi: Optional[str] = None
    views: int = Field(default=0)
    score: int = Field(default=0)
    num_comments: int = Field(default=0)
