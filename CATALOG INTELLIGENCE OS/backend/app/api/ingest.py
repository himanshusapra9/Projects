import csv
import io
import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.product import SourceRecord
from app.schemas.product import IngestResponse, SingleIngestResponse, IngestStatusResponse, ProductIngest
from app.workers.tasks import process_source_record

router = APIRouter()


@router.post("/upload", response_model=IngestResponse)
async def upload_feed(
    file: UploadFile = File(...),
    supplier_id: str = Form(...),
    session: AsyncSession = Depends(get_session),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("csv", "json"):
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported")

    content = await file.read()
    text = content.decode("utf-8")
    records: list[dict] = []

    if ext == "csv":
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            records.append(dict(row))
    else:
        parsed = json.loads(text)
        records = parsed if isinstance(parsed, list) else [parsed]

    if not records:
        raise HTTPException(status_code=400, detail="File contains no records")

    job_id = str(uuid4())

    for raw in records:
        source_record = SourceRecord(
            id=str(uuid4()),
            supplier_id=supplier_id,
            raw_fields=raw,
            supplier_category=raw.get("category"),
            feed_version=job_id,
            processing_status="pending",
        )
        session.add(source_record)
        await session.flush()
        process_source_record.delay(source_record.id)

    await session.commit()

    return IngestResponse(
        job_id=job_id,
        supplier_id=supplier_id,
        record_count=len(records),
        queued_at=datetime.now(timezone.utc),
        status="processing",
    )


@router.post("/single", response_model=SingleIngestResponse)
async def ingest_single(
    payload: ProductIngest,
    session: AsyncSession = Depends(get_session),
):
    raw_fields = {
        "title": payload.title,
        "description": payload.description,
        "sku": payload.sku,
        "price": payload.price,
        "images": payload.images,
        "brand": payload.brand,
        "gtin": payload.gtin,
        "upc": payload.upc,
    }
    if payload.extra_fields:
        raw_fields.update(payload.extra_fields)

    source_record = SourceRecord(
        id=str(uuid4()),
        supplier_id=payload.supplier_id,
        raw_fields=raw_fields,
        processing_status="pending",
    )
    session.add(source_record)
    await session.commit()

    process_source_record.delay(source_record.id)

    return SingleIngestResponse(source_record_id=source_record.id, status="queued")


@router.get("/status/{job_id}", response_model=IngestStatusResponse)
async def get_ingest_status(
    job_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(
            SourceRecord.processing_status,
            func.count(SourceRecord.id),
        )
        .where(SourceRecord.feed_version == job_id)
        .group_by(SourceRecord.processing_status)
    )
    rows = result.all()

    if not rows:
        raise HTTPException(status_code=404, detail="Job not found")

    status_counts: dict[str, int] = {}
    total = 0
    for status, count in rows:
        status_counts[status] = count
        total += count

    return IngestStatusResponse(
        total=total,
        completed=status_counts.get("completed", 0),
        failed=status_counts.get("failed", 0),
        in_progress=status_counts.get("processing", 0) + status_counts.get("pending", 0),
        errors=[],
    )
