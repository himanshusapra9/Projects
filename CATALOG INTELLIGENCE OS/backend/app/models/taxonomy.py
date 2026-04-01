from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TaxonomyNode(Base):
    __tablename__ = "taxonomy_nodes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    path: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    depth: Mapped[int] = mapped_column(Integer, nullable=False)
    parent_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("taxonomy_nodes.id"), nullable=True)
    product_count: Mapped[int] = mapped_column(Integer, default=0)
    attribute_schema: Mapped[dict] = mapped_column(JSONB, default=dict)
    quality_threshold: Mapped[float] = mapped_column(Float, default=0.80)
    taxonomy_version: Mapped[str] = mapped_column(String(50), default="v1")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    parent = relationship("TaxonomyNode", remote_side="TaxonomyNode.id", backref="children")
