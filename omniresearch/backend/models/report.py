from pydantic import BaseModel, Field


class ExportConfig(BaseModel):
    format: str = Field(default="csv", description="csv, pdf, json, markdown")
    include_sources: bool = True
    include_sentiment: bool = True
    include_metadata: bool = True


class SynthesisInput(BaseModel):
    query: str
    documents: list[dict[str, object]] = Field(default_factory=list)
    depth: str = "standard"


class Report(BaseModel):
    task_id: str = ""
    query: str = ""
    synthesis: str = ""
    sources_count: int = 0
    export_formats: list[str] = Field(
        default_factory=lambda: ["csv", "pdf", "json", "markdown"]
    )
    status: str = "pending"
