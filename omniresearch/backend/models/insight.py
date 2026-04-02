from pydantic import BaseModel, Field


class SentimentResult(BaseModel):
    label: str = Field(default="neutral")
    score: float = Field(default=0.0)
    polarity: float = Field(default=0.0)


class Insight(BaseModel):
    id: str = Field(default="")
    text: str = Field(default="")
    source_type: str = Field(default="")
    source_name: str = Field(default="")
    url: str = Field(default="")
    date: str = Field(default="")
    author: str = Field(default="")
    geographic_region: str = Field(default="Global")
    data_type: str = Field(default="")
    credibility_score: float = Field(default=0.0)
    sentiment_label: str = Field(default="")
    sentiment_score: float = Field(default=0.0)
    relevance_score: float = Field(default=0.0)
    citation_count: int = Field(default=0)
    report_section: str = Field(default="")
    research_depth: str = Field(default="standard")
    sub_query_matched: str = Field(default="")
