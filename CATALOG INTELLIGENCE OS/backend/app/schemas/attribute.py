from typing import Any, Optional
from pydantic import BaseModel


class AttributeExtractionResult(BaseModel):
    attribute_key: str
    raw_value: str
    canonical_value: Any
    confidence: float
    extraction_type: str
    evidence: dict


class AttributeUpdate(BaseModel):
    attribute_key: str
    value: dict
    confidence: Optional[float] = None
    is_approved: bool = False
