from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TaxonomyNodeOut(BaseModel):
    id: str
    name: str
    path: list[str]
    depth: int
    parent_id: Optional[str] = None
    product_count: int
    attribute_schema: dict
    quality_threshold: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TaxonomyTreeNode(BaseModel):
    id: str
    name: str
    path: list[str]
    depth: int
    product_count: int
    children: list["TaxonomyTreeNode"] = []

    model_config = {"from_attributes": True}


class TaxonomyListResponse(BaseModel):
    nodes: list[TaxonomyNodeOut]
    total: int
