from dataclasses import dataclass, field
from typing import Optional

from app.services.taxonomy_classifier import TaxonomyClassifier, TaxonomyPrediction
from app.services.attribute_extractor import AttributeExtractor, ExtractedAttribute
from app.services.quality_scorer import QualityScorer, QualityScore


@dataclass
class EnrichmentResult:
    taxonomy_predictions: list[TaxonomyPrediction] = field(default_factory=list)
    extracted_attributes: list[ExtractedAttribute] = field(default_factory=list)
    quality_score: Optional[QualityScore] = None
    processing_errors: list[str] = field(default_factory=list)


class EnrichmentPipeline:
    def __init__(self):
        self.classifier = TaxonomyClassifier()
        self.extractor = AttributeExtractor()
        self.scorer = QualityScorer()

    async def run(
        self,
        title: str,
        description: str,
        raw_fields: dict,
        source_id: str,
    ) -> EnrichmentResult:
        result = EnrichmentResult()

        try:
            result.taxonomy_predictions = await self.classifier.classify(title, description, top_k=3)
        except Exception as e:
            result.processing_errors.append(f"Taxonomy classification failed: {e}")

        category_id = (
            result.taxonomy_predictions[0].category_id
            if result.taxonomy_predictions
            else "cat_uncategorized"
        )

        try:
            result.extracted_attributes = await self.extractor.extract_all(
                title=title,
                description=description,
                category_id=category_id,
                existing_fields=raw_fields,
                source_id=source_id,
            )
        except Exception as e:
            result.processing_errors.append(f"Attribute extraction failed: {e}")

        return result
