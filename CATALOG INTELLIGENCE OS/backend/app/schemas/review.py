from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ReviewTaskOut(BaseModel):
    id: str
    task_type: str
    product_id: str
    attribute_key: Optional[str] = None
    suggested_value: dict
    current_value: Optional[dict] = None
    confidence: float
    extraction_type: str
    evidence: dict
    status: str
    priority: str
    assigned_to: Optional[str] = None
    resolved_value: Optional[dict] = None
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    sla_deadline: Optional[datetime] = None
    model_version: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReviewTaskWithProduct(ReviewTaskOut):
    product_title: Optional[str] = None
    product_brand: Optional[str] = None
    product_image_url: Optional[str] = None
    category_path: Optional[list[str]] = None


class ReviewTaskListResponse(BaseModel):
    tasks: list[ReviewTaskWithProduct]
    total: int
    page: int
    per_page: int
    has_next: bool


class ReviewAcceptRequest(BaseModel):
    reviewer_id: str
    note: Optional[str] = None


class ReviewRejectRequest(BaseModel):
    reviewer_id: str
    note: Optional[str] = None


class ReviewEditRequest(BaseModel):
    reviewer_id: str
    corrected_value: dict
    note: Optional[str] = None


class BulkAcceptRequest(BaseModel):
    task_ids: list[str]
    reviewer_id: str


class BulkAcceptResponse(BaseModel):
    accepted: int
    failed: int
    errors: list[str]


class ReviewActionResponse(BaseModel):
    task_id: str
    status: str
    updated_at: Optional[datetime] = None
    resolved_value: Optional[dict] = None
