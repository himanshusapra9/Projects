from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.taxonomy import TaxonomyNode
from app.schemas.taxonomy import TaxonomyNodeOut, TaxonomyListResponse

router = APIRouter()


@router.get("", response_model=TaxonomyListResponse)
async def list_taxonomy(
    parent_id: str | None = None,
    session: AsyncSession = Depends(get_session),
):
    query = select(TaxonomyNode).where(TaxonomyNode.is_active == True)
    if parent_id:
        query = query.where(TaxonomyNode.parent_id == parent_id)

    result = await session.execute(query.order_by(TaxonomyNode.name))
    nodes = result.scalars().all()

    return TaxonomyListResponse(
        nodes=[
            TaxonomyNodeOut(
                id=n.id,
                name=n.name,
                path=n.path,
                depth=n.depth,
                parent_id=n.parent_id,
                product_count=n.product_count,
                attribute_schema=n.attribute_schema,
                quality_threshold=n.quality_threshold,
                is_active=n.is_active,
                created_at=n.created_at,
            )
            for n in nodes
        ],
        total=len(nodes),
    )


@router.get("/{node_id}", response_model=TaxonomyNodeOut)
async def get_taxonomy_node(
    node_id: str,
    session: AsyncSession = Depends(get_session),
):
    node = await session.get(TaxonomyNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Taxonomy node not found")

    return TaxonomyNodeOut(
        id=node.id,
        name=node.name,
        path=node.path,
        depth=node.depth,
        parent_id=node.parent_id,
        product_count=node.product_count,
        attribute_schema=node.attribute_schema,
        quality_threshold=node.quality_threshold,
        is_active=node.is_active,
        created_at=node.created_at,
    )
