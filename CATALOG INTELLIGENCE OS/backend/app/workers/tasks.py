import asyncio
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from celery import Celery

from app.config import settings

celery_app = Celery("cios", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def process_source_record(self, source_record_id: str):
    asyncio.run(_process_source_record_async(source_record_id))


async def _process_source_record_async(source_record_id: str):
    from app.database import get_async_session
    from app.models.product import SourceRecord, CanonicalProduct, AttributeRecord, ExtractionType, ProductStatus
    from app.models.review import ReviewTask, ReviewTaskType
    from app.models.audit import AuditLog
    from app.models.taxonomy import TaxonomyNode
    from app.services.taxonomy_classifier import TaxonomyClassifier
    from app.services.attribute_extractor import AttributeExtractor
    from app.services.quality_scorer import QualityScorer

    async with get_async_session() as session:
        source_record = await session.get(SourceRecord, source_record_id)
        if not source_record:
            raise ValueError(f"SourceRecord {source_record_id} not found")

        source_record.processing_status = "processing"
        await session.flush()

        raw = source_record.raw_fields
        title = raw.get("title", "")
        description = raw.get("description", "") or raw.get("desc", "")

        classifier = TaxonomyClassifier()
        predictions = await classifier.classify(title, description, top_k=3)
        top_pred = predictions[0] if predictions else None

        product = CanonicalProduct(
            id=str(uuid4()),
            status=ProductStatus.draft,
            taxonomy_id=top_pred.category_id if top_pred else None,
            taxonomy_confidence=top_pred.confidence if top_pred else None,
            identity={
                "title": title,
                "brand": raw.get("brand"),
                "sku": raw.get("sku"),
                "gtin": raw.get("gtin") or raw.get("upc"),
            },
            source_ids=[source_record_id],
            quality_score=0.0,
        )
        session.add(product)
        source_record.canonical_product_id = product.id

        if top_pred:
            if classifier.should_auto_approve(top_pred.confidence):
                session.add(
                    AuditLog(
                        product_id=product.id,
                        field_path="taxonomy.canonical_category_id",
                        before_value=None,
                        after_value={"category_id": top_pred.category_id, "path": top_pred.category_path},
                        change_source="ai_suggestion",
                        confidence=top_pred.confidence,
                        review_action="auto_accepted",
                        review_note=f"Auto-accepted: confidence {top_pred.confidence:.2f} >= {TaxonomyClassifier.AUTO_APPROVE_THRESHOLD}",
                    )
                )
            else:
                priority = "high" if top_pred.confidence < 0.70 else "medium"
                session.add(
                    ReviewTask(
                        task_type=ReviewTaskType.taxonomy_suggestion,
                        product_id=product.id,
                        attribute_key="taxonomy",
                        suggested_value={
                            "category_id": top_pred.category_id,
                            "category_path": top_pred.category_path,
                            "alternatives": [
                                {"category_id": p.category_id, "confidence": p.confidence}
                                for p in predictions[1:]
                            ],
                        },
                        confidence=top_pred.confidence,
                        extraction_type=ExtractionType.inferred,
                        evidence=top_pred.evidence,
                        priority=priority,
                        sla_deadline=datetime.now(timezone.utc) + timedelta(hours=48),
                    )
                )

        extractor = AttributeExtractor()
        extracted_attrs = await extractor.extract_all(
            title=title,
            description=description,
            category_id=top_pred.category_id if top_pred else "cat_uncategorized",
            existing_fields=raw,
            source_id=source_record_id,
        )

        AUTO_APPROVE_ATTR_THRESHOLD = 0.90
        for attr in extracted_attrs:
            attr_record = AttributeRecord(
                product_id=product.id,
                attribute_key=attr.attribute_key,
                value={"raw": attr.raw_value, "canonical": attr.canonical_value},
                confidence=attr.confidence,
                extraction_type=attr.extraction_type,
                source_id=source_record_id,
                evidence=attr.evidence,
                is_approved=False,
            )
            session.add(attr_record)

            if (
                attr.confidence >= AUTO_APPROVE_ATTR_THRESHOLD
                and attr.extraction_type in [ExtractionType.extracted, ExtractionType.normalized]
            ):
                attr_record.is_approved = True
                session.add(
                    AuditLog(
                        product_id=product.id,
                        field_path=f"attributes.{attr.attribute_key}",
                        before_value=None,
                        after_value={"value": attr.canonical_value, "confidence": attr.confidence},
                        change_source="ai_suggestion",
                        confidence=attr.confidence,
                        review_action="auto_accepted",
                        review_note=f"Auto-accepted: {attr.extraction_type.value} with confidence {attr.confidence:.2f}",
                    )
                )
            else:
                priority = "high" if attr.extraction_type == ExtractionType.llm_generated else "medium"
                session.add(
                    ReviewTask(
                        task_type=ReviewTaskType.attribute_suggestion,
                        product_id=product.id,
                        attribute_key=attr.attribute_key,
                        suggested_value={"raw": attr.raw_value, "canonical": attr.canonical_value},
                        confidence=attr.confidence,
                        extraction_type=attr.extraction_type,
                        evidence=attr.evidence,
                        priority=priority,
                        sla_deadline=datetime.now(timezone.utc) + timedelta(hours=72),
                    )
                )

        await session.flush()

        category = await session.get(TaxonomyNode, top_pred.category_id if top_pred else "cat_uncategorized")
        if category:
            approved_attr_records = []
            for attr in extracted_attrs:
                if (
                    attr.confidence >= AUTO_APPROVE_ATTR_THRESHOLD
                    and attr.extraction_type in [ExtractionType.extracted, ExtractionType.normalized]
                ):
                    mock_record = AttributeRecord(
                        product_id=product.id,
                        attribute_key=attr.attribute_key,
                        value={"canonical": attr.canonical_value},
                        confidence=attr.confidence,
                        extraction_type=attr.extraction_type,
                        is_approved=True,
                    )
                    approved_attr_records.append(mock_record)

            scorer = QualityScorer()
            quality = await scorer.score(product, approved_attr_records, category)
            product.quality_score = quality.overall
            product.quality_dimensions = {
                "completeness": quality.completeness,
                "conformity": quality.conformity,
                "consistency": quality.consistency,
                "freshness": quality.freshness,
                "missing_required": quality.missing_required,
                "issues": quality.issues,
            }

        source_record.processing_status = "completed"
        await session.commit()
