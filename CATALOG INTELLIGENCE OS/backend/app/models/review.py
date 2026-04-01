import enum
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.product import ExtractionType


class ReviewTaskType(str, enum.Enum):
    taxonomy_suggestion = "taxonomy_suggestion"
    attribute_suggestion = "attribute_suggestion"
    conflict_resolution = "conflict_resolution"
    duplicate_review = "duplicate_review"
    quality_alert = "quality_alert"


class ReviewTaskStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    edited = "edited"
    escalated = "escalated"
    auto_accepted = "auto_accepted"


class ReviewTask(Base):
    __tablename__ = "review_tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    task_type: Mapped[ReviewTaskType] = mapped_column(SQLEnum(ReviewTaskType))
    product_id: Mapped[str] = mapped_column(String, ForeignKey("canonical_products.id"), index=True)
    attribute_key: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    suggested_value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    current_value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    extraction_type: Mapped[ExtractionType] = mapped_column(SQLEnum(ExtractionType, create_constraint=False))
    evidence: Mapped[dict] = mapped_column(JSONB, default=dict)
    status: Mapped[ReviewTaskStatus] = mapped_column(
        SQLEnum(ReviewTaskStatus), default=ReviewTaskStatus.pending
    )
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    assigned_to: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    resolved_value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    resolved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sla_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
