from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models.product import CanonicalProduct, AttributeRecord
from app.models.review import ReviewTask, ReviewTaskStatus, ReviewTaskType
from app.models.audit import AuditLog
from app.schemas.review import (
    ReviewTaskWithProduct,
    ReviewTaskListResponse,
    ReviewAcceptRequest,
    ReviewRejectRequest,
    ReviewEditRequest,
    BulkAcceptRequest,
    BulkAcceptResponse,
    ReviewActionResponse,
)

router = APIRouter()


@router.get("/tasks", response_model=ReviewTaskListResponse)
async def list_review_tasks(
    task_type: str | None = None,
    status: str | None = Query(default="pending"),
    confidence_band: str | None = None,
    category_id: str | None = None,
    attribute_key: str | None = None,
    priority: str | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    query = (
        select(ReviewTask, CanonicalProduct)
        .outerjoin(CanonicalProduct, ReviewTask.product_id == CanonicalProduct.id)
        .options(selectinload(CanonicalProduct.taxonomy))
    )

    if task_type:
        query = query.where(ReviewTask.task_type == task_type)
    if status:
        query = query.where(ReviewTask.status == status)
    if confidence_band == "high":
        query = query.where(ReviewTask.confidence >= 0.85)
    elif confidence_band == "medium":
        query = query.where(and_(ReviewTask.confidence >= 0.70, ReviewTask.confidence < 0.85))
    elif confidence_band == "low":
        query = query.where(ReviewTask.confidence < 0.70)
    if category_id:
        query = query.where(CanonicalProduct.taxonomy_id == category_id)
    if attribute_key:
        query = query.where(ReviewTask.attribute_key == attribute_key)
    if priority:
        query = query.where(ReviewTask.priority == priority)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(ReviewTask.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await session.execute(query)
    rows = result.all()

    tasks = []
    for task, product in rows:
        taxonomy_path = None
        if product and product.taxonomy:
            taxonomy_path = product.taxonomy.path if hasattr(product, "taxonomy") and product.taxonomy else None

        tasks.append(
            ReviewTaskWithProduct(
                id=task.id,
                task_type=task.task_type.value if hasattr(task.task_type, "value") else task.task_type,
                product_id=task.product_id,
                attribute_key=task.attribute_key,
                suggested_value=task.suggested_value,
                current_value=task.current_value,
                confidence=task.confidence,
                extraction_type=task.extraction_type.value if hasattr(task.extraction_type, "value") else task.extraction_type,
                evidence=task.evidence,
                status=task.status.value if hasattr(task.status, "value") else task.status,
                priority=task.priority,
                assigned_to=task.assigned_to,
                resolved_value=task.resolved_value,
                resolved_by=task.resolved_by,
                resolved_at=task.resolved_at,
                sla_deadline=task.sla_deadline,
                model_version=task.model_version,
                created_at=task.created_at,
                product_title=product.identity.get("title") if product else None,
                product_brand=product.identity.get("brand") if product else None,
                product_image_url=(product.identity.get("images") or [None])[0] if product else None,
                category_path=taxonomy_path,
            )
        )

    return ReviewTaskListResponse(
        tasks=tasks,
        total=total,
        page=page,
        per_page=per_page,
        has_next=(page * per_page) < total,
    )


@router.post("/tasks/{task_id}/accept", response_model=ReviewActionResponse)
async def accept_task(
    task_id: str,
    body: ReviewAcceptRequest,
    session: AsyncSession = Depends(get_session),
):
    task = await session.get(ReviewTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != ReviewTaskStatus.pending:
        raise HTTPException(status_code=400, detail=f"Task is already {task.status.value}")

    now = datetime.now(timezone.utc)
    task.status = ReviewTaskStatus.accepted
    task.resolved_by = body.reviewer_id
    task.resolved_at = now
    task.resolved_value = task.suggested_value

    if task.task_type == ReviewTaskType.attribute_suggestion and task.attribute_key:
        result = await session.execute(
            select(AttributeRecord).where(
                and_(
                    AttributeRecord.product_id == task.product_id,
                    AttributeRecord.attribute_key == task.attribute_key,
                )
            )
        )
        attr_record = result.scalar_one_or_none()
        if attr_record:
            attr_record.is_approved = True

    elif task.task_type == ReviewTaskType.taxonomy_suggestion:
        product = await session.get(CanonicalProduct, task.product_id)
        if product and task.suggested_value.get("category_id"):
            product.taxonomy_id = task.suggested_value["category_id"]

    session.add(
        AuditLog(
            product_id=task.product_id,
            field_path=f"review.{task.task_type.value}.{task.attribute_key or 'taxonomy'}",
            before_value=task.current_value,
            after_value=task.suggested_value,
            change_source="human_edit",
            confidence=task.confidence,
            reviewed_by=body.reviewer_id,
            review_action="accepted",
            review_note=body.note,
        )
    )

    await session.commit()

    return ReviewActionResponse(task_id=task_id, status="accepted", updated_at=now)


@router.post("/tasks/{task_id}/reject", response_model=ReviewActionResponse)
async def reject_task(
    task_id: str,
    body: ReviewRejectRequest,
    session: AsyncSession = Depends(get_session),
):
    task = await session.get(ReviewTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != ReviewTaskStatus.pending:
        raise HTTPException(status_code=400, detail=f"Task is already {task.status.value}")

    now = datetime.now(timezone.utc)
    task.status = ReviewTaskStatus.rejected
    task.resolved_by = body.reviewer_id
    task.resolved_at = now

    session.add(
        AuditLog(
            product_id=task.product_id,
            field_path=f"review.{task.task_type.value}.{task.attribute_key or 'taxonomy'}",
            before_value=task.suggested_value,
            after_value={"rejected": True},
            change_source="human_edit",
            confidence=task.confidence,
            reviewed_by=body.reviewer_id,
            review_action="rejected",
            review_note=body.note,
        )
    )

    await session.commit()

    return ReviewActionResponse(task_id=task_id, status="rejected", updated_at=now)


@router.post("/tasks/{task_id}/edit", response_model=ReviewActionResponse)
async def edit_task(
    task_id: str,
    body: ReviewEditRequest,
    session: AsyncSession = Depends(get_session),
):
    task = await session.get(ReviewTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != ReviewTaskStatus.pending:
        raise HTTPException(status_code=400, detail=f"Task is already {task.status.value}")

    now = datetime.now(timezone.utc)
    task.status = ReviewTaskStatus.edited
    task.resolved_by = body.reviewer_id
    task.resolved_at = now
    task.resolved_value = body.corrected_value

    if task.task_type == ReviewTaskType.attribute_suggestion and task.attribute_key:
        result = await session.execute(
            select(AttributeRecord).where(
                and_(
                    AttributeRecord.product_id == task.product_id,
                    AttributeRecord.attribute_key == task.attribute_key,
                )
            )
        )
        attr_record = result.scalar_one_or_none()
        if attr_record:
            attr_record.value = body.corrected_value
            attr_record.is_approved = True
            attr_record.confidence = 1.0

    session.add(
        AuditLog(
            product_id=task.product_id,
            field_path=f"review.{task.task_type.value}.{task.attribute_key or 'taxonomy'}",
            before_value=task.suggested_value,
            after_value=body.corrected_value,
            change_source="human_edit",
            confidence=1.0,
            reviewed_by=body.reviewer_id,
            review_action="edited",
            review_note=body.note,
        )
    )

    await session.commit()

    return ReviewActionResponse(
        task_id=task_id, status="edited", updated_at=now, resolved_value=body.corrected_value
    )


@router.post("/tasks/bulk_accept", response_model=BulkAcceptResponse)
async def bulk_accept_tasks(
    body: BulkAcceptRequest,
    session: AsyncSession = Depends(get_session),
):
    if len(body.task_ids) > 500:
        raise HTTPException(status_code=400, detail="Maximum 500 tasks per bulk operation")

    accepted = 0
    failed = 0
    errors: list[str] = []
    now = datetime.now(timezone.utc)

    for task_id in body.task_ids:
        task = await session.get(ReviewTask, task_id)
        if not task:
            failed += 1
            errors.append(f"Task {task_id} not found")
            continue
        if task.status != ReviewTaskStatus.pending:
            failed += 1
            errors.append(f"Task {task_id} is already {task.status.value}")
            continue

        task.status = ReviewTaskStatus.accepted
        task.resolved_by = body.reviewer_id
        task.resolved_at = now
        task.resolved_value = task.suggested_value

        if task.task_type == ReviewTaskType.attribute_suggestion and task.attribute_key:
            result = await session.execute(
                select(AttributeRecord).where(
                    and_(
                        AttributeRecord.product_id == task.product_id,
                        AttributeRecord.attribute_key == task.attribute_key,
                    )
                )
            )
            attr_record = result.scalar_one_or_none()
            if attr_record:
                attr_record.is_approved = True

        session.add(
            AuditLog(
                product_id=task.product_id,
                field_path=f"review.{task.task_type.value}.{task.attribute_key or 'taxonomy'}",
                before_value=task.current_value,
                after_value=task.suggested_value,
                change_source="human_edit",
                confidence=task.confidence,
                reviewed_by=body.reviewer_id,
                review_action="bulk_accepted",
            )
        )

        accepted += 1

    await session.commit()

    return BulkAcceptResponse(accepted=accepted, failed=failed, errors=errors)
