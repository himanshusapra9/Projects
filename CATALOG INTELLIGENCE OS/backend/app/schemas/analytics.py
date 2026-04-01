from typing import Optional
from pydantic import BaseModel


class StatusCounts(BaseModel):
    draft: int = 0
    in_review: int = 0
    published: int = 0
    archived: int = 0


class QualityDistribution(BaseModel):
    excellent: int = 0
    good: int = 0
    fair: int = 0
    poor: int = 0


class CategoryHealth(BaseModel):
    category_id: str
    category_name: str
    product_count: int
    avg_quality: float
    completeness: float
    conformity: float


class TopIssue(BaseModel):
    issue_type: str
    affected_products: int
    description: str


class CatalogHealthResponse(BaseModel):
    overall_quality: float
    total_products: int
    by_status: StatusCounts
    quality_distribution: QualityDistribution
    by_category: list[CategoryHealth]
    top_issues: list[TopIssue]


class AttributeCoverage(BaseModel):
    attribute_key: str
    required: bool
    coverage_pct: float
    approved_count: int
    total_count: int


class CategoryAttributeCoverage(BaseModel):
    category_id: str
    category_name: str
    attributes: list[AttributeCoverage]


class AttributeCoverageResponse(BaseModel):
    by_category: list[CategoryAttributeCoverage]


class ReviewQueueStats(BaseModel):
    total_pending: int
    by_type: dict[str, int]
    by_priority: dict[str, int]
    avg_age_hours: float
    sla_at_risk: int
    throughput_last_7d: int


class SupplierQuality(BaseModel):
    supplier_id: str
    supplier_name: str
    total_products: int
    avg_quality: float
    trust_scores: dict[str, float]
    last_feed_at: Optional[str] = None
    trend: str = "stable"


class SupplierQualityResponse(BaseModel):
    suppliers: list[SupplierQuality]
