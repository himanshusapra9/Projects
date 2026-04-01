import enum
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, func, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.database import Base


class ExtractionType(str, enum.Enum):
    extracted = "extracted"
    normalized = "normalized"
    inferred = "inferred"
    llm_generated = "llm_generated"


class ProductStatus(str, enum.Enum):
    draft = "draft"
    in_review = "in_review"
    published = "published"
    archived = "archived"


class SourceRecord(Base):
    __tablename__ = "source_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    supplier_id: Mapped[str] = mapped_column(String, ForeignKey("suppliers.id"))
    canonical_product_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("canonical_products.id"), nullable=True
    )
    raw_fields: Mapped[dict] = mapped_column(JSONB, nullable=False)
    supplier_category: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    feed_version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processing_status: Mapped[str] = mapped_column(String(50), default="pending")

    supplier = relationship("Supplier", backref="source_records")
    canonical_product = relationship("CanonicalProduct", backref="source_records")


class CanonicalProduct(Base):
    __tablename__ = "canonical_products"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    status: Mapped[ProductStatus] = mapped_column(SQLEnum(ProductStatus), default=ProductStatus.draft)
    taxonomy_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("taxonomy_nodes.id"), nullable=True
    )
    taxonomy_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    identity: Mapped[dict] = mapped_column(JSONB, default=dict)
    quality_score: Mapped[float] = mapped_column(Float, default=0.0)
    quality_dimensions: Mapped[dict] = mapped_column(JSONB, default=dict)
    source_ids: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    embedding: Mapped[Optional[list]] = mapped_column(Vector(384), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    taxonomy = relationship("TaxonomyNode", backref="products")
    attributes = relationship("AttributeRecord", backref="product", cascade="all, delete-orphan")
    review_tasks = relationship("ReviewTask", backref="product", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", backref="product", cascade="all, delete-orphan")


class AttributeRecord(Base):
    __tablename__ = "attribute_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    product_id: Mapped[str] = mapped_column(String, ForeignKey("canonical_products.id"), index=True)
    attribute_key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    extraction_type: Mapped[ExtractionType] = mapped_column(SQLEnum(ExtractionType))
    source_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("source_records.id"), nullable=True)
    evidence: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
