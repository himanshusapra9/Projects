from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import String, Float, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    product_id: Mapped[str] = mapped_column(String, ForeignKey("canonical_products.id"), index=True)
    field_path: Mapped[str] = mapped_column(String(200))
    before_value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    after_value: Mapped[dict] = mapped_column(JSONB)
    change_source: Mapped[str] = mapped_column(String(50))
    model_version: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    review_action: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
