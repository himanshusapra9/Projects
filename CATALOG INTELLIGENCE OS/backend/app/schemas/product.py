from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


class ProductIngest(BaseModel):
    supplier_id: str
    title: str
    description: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    images: Optional[list[str]] = None
    brand: Optional[str] = None
    gtin: Optional[str] = None
    upc: Optional[str] = None
    extra_fields: Optional[dict[str, Any]] = None


class AttributeOut(BaseModel):
    id: str
    attribute_key: str
    value: dict
    confidence: float
    extraction_type: str
    evidence: dict
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductSummary(BaseModel):
    id: str
    title: Optional[str] = None
    brand: Optional[str] = None
    category_path: Optional[list[str]] = None
    quality_score: float
    status: str
    attribute_count: int = 0
    pending_review_count: int = 0
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class QualityBreakdown(BaseModel):
    overall: float
    completeness: float = 0.0
    conformity: float = 0.0
    consistency: float = 0.0
    freshness: float = 0.0
    missing_required: list[str] = []
    issues: list[str] = []


class AuditLogOut(BaseModel):
    id: str
    field_path: str
    before_value: Optional[dict] = None
    after_value: dict
    change_source: str
    confidence: Optional[float] = None
    reviewed_by: Optional[str] = None
    review_action: Optional[str] = None
    review_note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductDetail(BaseModel):
    id: str
    status: str
    taxonomy_id: Optional[str] = None
    taxonomy_confidence: Optional[float] = None
    category_path: Optional[list[str]] = None
    identity: dict
    quality_score: float
    quality_dimensions: dict
    source_ids: list[str]
    attributes: list[AttributeOut]
    review_task_counts: dict[str, int] = {}
    audit_logs: list[AuditLogOut] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    products: list[ProductSummary]
    total: int
    page: int
    per_page: int


class IngestResponse(BaseModel):
    job_id: str
    supplier_id: str
    record_count: int
    queued_at: datetime
    status: str = "processing"


class SingleIngestResponse(BaseModel):
    source_record_id: str
    status: str = "queued"


class IngestStatusResponse(BaseModel):
    total: int
    completed: int
    failed: int
    in_progress: int
    errors: list[str] = []
