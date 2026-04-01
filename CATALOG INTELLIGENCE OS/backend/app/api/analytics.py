from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.product import CanonicalProduct, AttributeRecord
from app.models.review import ReviewTask, ReviewTaskStatus
from app.models.taxonomy import TaxonomyNode
from app.models.supplier import Supplier
from app.schemas.analytics import (
    CatalogHealthResponse,
    StatusCounts,
    QualityDistribution,
    CategoryHealth,
    TopIssue,
    AttributeCoverageResponse,
    CategoryAttributeCoverage,
    AttributeCoverage,
    ReviewQueueStats,
    SupplierQualityResponse,
    SupplierQuality,
)

router = APIRouter()


@router.get("/catalog_health", response_model=CatalogHealthResponse)
async def catalog_health(session: AsyncSession = Depends(get_session)):
    total_result = await session.execute(select(func.count(CanonicalProduct.id)))
    total_products = total_result.scalar() or 0

    avg_result = await session.execute(select(func.avg(CanonicalProduct.quality_score)))
    overall_quality = round(float(avg_result.scalar() or 0), 3)

    status_result = await session.execute(
        select(CanonicalProduct.status, func.count(CanonicalProduct.id)).group_by(CanonicalProduct.status)
    )
    status_map = {row[0].value if hasattr(row[0], "value") else str(row[0]): row[1] for row in status_result.all()}
    by_status = StatusCounts(
        draft=status_map.get("draft", 0),
        in_review=status_map.get("in_review", 0),
        published=status_map.get("published", 0),
        archived=status_map.get("archived", 0),
    )

    dist_result = await session.execute(
        select(
            func.count(case((CanonicalProduct.quality_score >= 0.90, 1))),
            func.count(case((CanonicalProduct.quality_score.between(0.75, 0.8999), 1))),
            func.count(case((CanonicalProduct.quality_score.between(0.60, 0.7499), 1))),
            func.count(case((CanonicalProduct.quality_score < 0.60, 1))),
        )
    )
    dist_row = dist_result.one()
    quality_distribution = QualityDistribution(
        excellent=dist_row[0], good=dist_row[1], fair=dist_row[2], poor=dist_row[3]
    )

    cat_result = await session.execute(
        select(
            TaxonomyNode.id,
            TaxonomyNode.name,
            func.count(CanonicalProduct.id),
            func.avg(CanonicalProduct.quality_score),
        )
        .outerjoin(CanonicalProduct, CanonicalProduct.taxonomy_id == TaxonomyNode.id)
        .group_by(TaxonomyNode.id, TaxonomyNode.name)
        .order_by(func.count(CanonicalProduct.id).desc())
        .limit(20)
    )
    by_category = [
        CategoryHealth(
            category_id=row[0],
            category_name=row[1],
            product_count=row[2] or 0,
            avg_quality=round(float(row[3] or 0), 3),
            completeness=0.0,
            conformity=0.0,
        )
        for row in cat_result.all()
    ]

    top_issues = [
        TopIssue(
            issue_type="missing_attributes",
            affected_products=total_products,
            description="Products missing one or more required attributes",
        )
    ]

    return CatalogHealthResponse(
        overall_quality=overall_quality,
        total_products=total_products,
        by_status=by_status,
        quality_distribution=quality_distribution,
        by_category=by_category,
        top_issues=top_issues,
    )


@router.get("/attribute_coverage", response_model=AttributeCoverageResponse)
async def attribute_coverage(session: AsyncSession = Depends(get_session)):
    tax_result = await session.execute(
        select(TaxonomyNode).where(TaxonomyNode.is_active == True).limit(20)
    )
    categories = tax_result.scalars().all()

    by_category = []
    for cat in categories:
        required = cat.attribute_schema.get("required", [])
        recommended = cat.attribute_schema.get("recommended", [])
        all_attrs = required + recommended

        prod_count_result = await session.execute(
            select(func.count()).select_from(CanonicalProduct).where(CanonicalProduct.taxonomy_id == cat.id)
        )
        total_in_cat = prod_count_result.scalar() or 0
        if total_in_cat == 0:
            continue

        attr_coverages = []
        for attr_key in all_attrs:
            attr_count_result = await session.execute(
                select(func.count()).select_from(AttributeRecord).join(
                    CanonicalProduct, AttributeRecord.product_id == CanonicalProduct.id
                ).where(
                    CanonicalProduct.taxonomy_id == cat.id,
                    AttributeRecord.attribute_key == attr_key,
                )
            )
            total_count = attr_count_result.scalar() or 0

            approved_result = await session.execute(
                select(func.count()).select_from(AttributeRecord).join(
                    CanonicalProduct, AttributeRecord.product_id == CanonicalProduct.id
                ).where(
                    CanonicalProduct.taxonomy_id == cat.id,
                    AttributeRecord.attribute_key == attr_key,
                    AttributeRecord.is_approved == True,
                )
            )
            approved_count = approved_result.scalar() or 0

            attr_coverages.append(
                AttributeCoverage(
                    attribute_key=attr_key,
                    required=attr_key in required,
                    coverage_pct=round(total_count / total_in_cat * 100, 1) if total_in_cat else 0.0,
                    approved_count=approved_count,
                    total_count=total_count,
                )
            )

        by_category.append(
            CategoryAttributeCoverage(
                category_id=cat.id,
                category_name=cat.name,
                attributes=attr_coverages,
            )
        )

    return AttributeCoverageResponse(by_category=by_category)


@router.get("/review_queue_stats", response_model=ReviewQueueStats)
async def review_queue_stats(session: AsyncSession = Depends(get_session)):
    pending_result = await session.execute(
        select(func.count()).select_from(ReviewTask).where(ReviewTask.status == ReviewTaskStatus.pending)
    )
    total_pending = pending_result.scalar() or 0

    by_type_result = await session.execute(
        select(ReviewTask.task_type, func.count(ReviewTask.id))
        .where(ReviewTask.status == ReviewTaskStatus.pending)
        .group_by(ReviewTask.task_type)
    )
    by_type = {row[0].value if hasattr(row[0], "value") else str(row[0]): row[1] for row in by_type_result.all()}

    by_priority_result = await session.execute(
        select(ReviewTask.priority, func.count(ReviewTask.id))
        .where(ReviewTask.status == ReviewTaskStatus.pending)
        .group_by(ReviewTask.priority)
    )
    by_priority = {str(row[0]): row[1] for row in by_priority_result.all()}

    avg_age_result = await session.execute(
        select(func.avg(func.extract("epoch", func.now() - ReviewTask.created_at) / 3600))
        .where(ReviewTask.status == ReviewTaskStatus.pending)
    )
    avg_age_hours = round(float(avg_age_result.scalar() or 0), 1)

    now = datetime.now(timezone.utc)
    sla_result = await session.execute(
        select(func.count()).select_from(ReviewTask).where(
            ReviewTask.status == ReviewTaskStatus.pending,
            ReviewTask.sla_deadline < now,
        )
    )
    sla_at_risk = sla_result.scalar() or 0

    seven_days_ago = now - timedelta(days=7)
    throughput_result = await session.execute(
        select(func.count()).select_from(ReviewTask).where(
            ReviewTask.status.in_([ReviewTaskStatus.accepted, ReviewTaskStatus.rejected, ReviewTaskStatus.edited]),
            ReviewTask.resolved_at >= seven_days_ago,
        )
    )
    throughput_last_7d = throughput_result.scalar() or 0

    return ReviewQueueStats(
        total_pending=total_pending,
        by_type=by_type,
        by_priority=by_priority,
        avg_age_hours=avg_age_hours,
        sla_at_risk=sla_at_risk,
        throughput_last_7d=throughput_last_7d,
    )


@router.get("/supplier_quality", response_model=SupplierQualityResponse)
async def supplier_quality(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Supplier).where(Supplier.is_active == True))
    suppliers = result.scalars().all()

    supplier_list = []
    for s in suppliers:
        supplier_list.append(
            SupplierQuality(
                supplier_id=s.id,
                supplier_name=s.name,
                total_products=s.total_products,
                avg_quality=s.average_quality,
                trust_scores=s.trust_scores or {},
                last_feed_at=s.last_feed_at.isoformat() if s.last_feed_at else None,
                trend="stable",
            )
        )

    return SupplierQualityResponse(suppliers=supplier_list)
