from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.product import CanonicalProduct, AttributeRecord
from app.models.taxonomy import TaxonomyNode
from app.services.activation import ActivationService

router = APIRouter()


@router.get("/{product_id}")
async def export_product(
    product_id: str,
    format: str = Query(default="generic_json"),
    session: AsyncSession = Depends(get_session),
):
    product = await session.get(CanonicalProduct, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    from sqlalchemy import select
    attrs_result = await session.execute(
        select(AttributeRecord).where(
            AttributeRecord.product_id == product_id,
            AttributeRecord.is_approved == True,
        )
    )
    attributes_db = attrs_result.scalars().all()

    attributes = {}
    for a in attributes_db:
        attributes[a.attribute_key] = a.value.get("canonical") or a.value.get("value")

    taxonomy_path: list[str] = []
    if product.taxonomy_id:
        tax = await session.get(TaxonomyNode, product.taxonomy_id)
        if tax:
            taxonomy_path = tax.path

    service = ActivationService()
    payload = await service.generate_feed(
        product_id=product.id,
        identity=product.identity,
        attributes=attributes,
        taxonomy_path=taxonomy_path,
        target_format=format,
    )

    return payload.model_dump()
