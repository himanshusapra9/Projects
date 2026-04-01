from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.product import CanonicalProduct, AttributeRecord
from app.models.review import ReviewTask, ReviewTaskStatus
from app.models.audit import AuditLog
from app.models.taxonomy import TaxonomyNode
from app.schemas.product import ProductSummary, ProductDetail, ProductListResponse, AttributeOut, AuditLogOut

router = APIRouter()


@router.get("", response_model=ProductListResponse)
async def list_products(
    category_id: str | None = None,
    quality_min: float | None = None,
    quality_max: float | None = None,
    status: str | None = None,
    supplier_id: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    query = select(CanonicalProduct)

    if category_id:
        query = query.where(CanonicalProduct.taxonomy_id == category_id)
    if quality_min is not None:
        query = query.where(CanonicalProduct.quality_score >= quality_min)
    if quality_max is not None:
        query = query.where(CanonicalProduct.quality_score <= quality_max)
    if status:
        query = query.where(CanonicalProduct.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(CanonicalProduct.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await session.execute(query)
    products = result.scalars().all()

    summaries = []
    for p in products:
        attr_count_result = await session.execute(
            select(func.count()).select_from(AttributeRecord).where(AttributeRecord.product_id == p.id)
        )
        attr_count = attr_count_result.scalar() or 0

        pending_count_result = await session.execute(
            select(func.count()).select_from(ReviewTask).where(
                ReviewTask.product_id == p.id,
                ReviewTask.status == ReviewTaskStatus.pending,
            )
        )
        pending_count = pending_count_result.scalar() or 0

        category_path = None
        if p.taxonomy_id:
            tax = await session.get(TaxonomyNode, p.taxonomy_id)
            if tax:
                category_path = tax.path

        summaries.append(
            ProductSummary(
                id=p.id,
                title=p.identity.get("title"),
                brand=p.identity.get("brand"),
                category_path=category_path,
                quality_score=p.quality_score,
                status=p.status.value if hasattr(p.status, "value") else p.status,
                attribute_count=attr_count,
                pending_review_count=pending_count,
                updated_at=p.updated_at,
            )
        )

    return ProductListResponse(products=summaries, total=total, page=page, per_page=per_page)


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product(
    product_id: str,
    session: AsyncSession = Depends(get_session),
):
    product = await session.get(CanonicalProduct, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    attrs_result = await session.execute(
        select(AttributeRecord).where(AttributeRecord.product_id == product_id)
    )
    attributes = attrs_result.scalars().all()

    review_result = await session.execute(
        select(ReviewTask.status, func.count(ReviewTask.id))
        .where(ReviewTask.product_id == product_id)
        .group_by(ReviewTask.status)
    )
    review_counts = {row[0].value if hasattr(row[0], "value") else row[0]: row[1] for row in review_result.all()}

    audit_result = await session.execute(
        select(AuditLog)
        .where(AuditLog.product_id == product_id)
        .order_by(AuditLog.created_at.desc())
        .limit(20)
    )
    audit_logs = audit_result.scalars().all()

    category_path = None
    if product.taxonomy_id:
        tax = await session.get(TaxonomyNode, product.taxonomy_id)
        if tax:
            category_path = tax.path

    return ProductDetail(
        id=product.id,
        status=product.status.value if hasattr(product.status, "value") else product.status,
        taxonomy_id=product.taxonomy_id,
        taxonomy_confidence=product.taxonomy_confidence,
        category_path=category_path,
        identity=product.identity,
        quality_score=product.quality_score,
        quality_dimensions=product.quality_dimensions,
        source_ids=product.source_ids or [],
        attributes=[
            AttributeOut(
                id=a.id,
                attribute_key=a.attribute_key,
                value=a.value,
                confidence=a.confidence,
                extraction_type=a.extraction_type.value if hasattr(a.extraction_type, "value") else a.extraction_type,
                evidence=a.evidence,
                is_approved=a.is_approved,
                created_at=a.created_at,
            )
            for a in attributes
        ],
        review_task_counts=review_counts,
        audit_logs=[
            AuditLogOut(
                id=al.id,
                field_path=al.field_path,
                before_value=al.before_value,
                after_value=al.after_value,
                change_source=al.change_source,
                confidence=al.confidence,
                reviewed_by=al.reviewed_by,
                review_action=al.review_action,
                review_note=al.review_note,
                created_at=al.created_at,
            )
            for al in audit_logs
        ],
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.get("/{product_id}/audit")
async def get_product_audit(
    product_id: str,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=50, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
):
    product = await session.get(CanonicalProduct, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    count_result = await session.execute(
        select(func.count()).select_from(AuditLog).where(AuditLog.product_id == product_id)
    )
    total = count_result.scalar() or 0

    result = await session.execute(
        select(AuditLog)
        .where(AuditLog.product_id == product_id)
        .order_by(AuditLog.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    logs = result.scalars().all()

    return {
        "audit_logs": [
            AuditLogOut(
                id=al.id,
                field_path=al.field_path,
                before_value=al.before_value,
                after_value=al.after_value,
                change_source=al.change_source,
                confidence=al.confidence,
                reviewed_by=al.reviewed_by,
                review_action=al.review_action,
                review_note=al.review_note,
                created_at=al.created_at,
            )
            for al in logs
        ],
        "total": total,
    }
