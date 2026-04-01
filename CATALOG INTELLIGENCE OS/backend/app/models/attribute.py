# Attribute models are defined in product.py (AttributeRecord)
# This module re-exports for convenience
from app.models.product import AttributeRecord, ExtractionType

__all__ = ["AttributeRecord", "ExtractionType"]
