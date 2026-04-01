from datetime import UTC, datetime, timezone
from typing import Optional

from pydantic import BaseModel

from app.models.product import AttributeRecord, CanonicalProduct, ExtractionType
from app.models.taxonomy import TaxonomyNode


class QualityScore(BaseModel):
    overall: float
    completeness: float
    conformity: float
    consistency: float
    freshness: float
    missing_required: list[str]
    missing_recommended: list[str]
    issues: list[str]


class QualityScorer:
    WEIGHTS = {
        "completeness": 0.40,
        "conformity": 0.30,
        "consistency": 0.20,
        "freshness": 0.10,
    }

    async def score(
        self,
        product: CanonicalProduct,
        attributes: list[AttributeRecord],
        category: TaxonomyNode,
    ) -> QualityScore:
        required_attrs = category.attribute_schema.get("required", [])
        recommended_attrs = category.attribute_schema.get("recommended", [])
        found_attr_keys = {a.attribute_key for a in attributes if a.is_approved}

        if required_attrs:
            required_found = sum(1 for attr in required_attrs if attr in found_attr_keys)
            completeness = required_found / len(required_attrs)
        else:
            completeness = 0.70

        missing_required = [a for a in required_attrs if a not in found_attr_keys]
        missing_recommended = [a for a in recommended_attrs if a not in found_attr_keys]

        conformity = self._compute_conformity(attributes, category)
        consistency, consistency_issues = self._compute_consistency(attributes, product)
        freshness = self._compute_freshness(product.updated_at or product.created_at)

        overall = (
            completeness * self.WEIGHTS["completeness"]
            + conformity * self.WEIGHTS["conformity"]
            + consistency * self.WEIGHTS["consistency"]
            + freshness * self.WEIGHTS["freshness"]
        )

        issues: list[str] = []
        if missing_required:
            issues.append(f"Missing required attributes: {', '.join(missing_required)}")
        if len(missing_recommended) > 2:
            issues.append(f"Missing {len(missing_recommended)} recommended attributes")
        issues.extend(consistency_issues)
        if freshness < 0.70:
            days_old = (datetime.now(UTC) - (product.updated_at or product.created_at)).days if (product.updated_at or product.created_at) else 999
            issues.append(f"Product data is {days_old} days old (freshness threshold: 90 days)")

        return QualityScore(
            overall=round(overall, 3),
            completeness=round(completeness, 3),
            conformity=round(conformity, 3),
            consistency=round(consistency, 3),
            freshness=round(freshness, 3),
            missing_required=missing_required,
            missing_recommended=missing_recommended,
            issues=issues,
        )

    def _compute_conformity(self, attributes: list[AttributeRecord], category: TaxonomyNode) -> float:
        if not attributes:
            return 0.5

        enum_attributes = {
            "gender": {"Men", "Women", "Unisex", "Boys", "Girls", "Baby"},
            "size": {"XS", "S", "M", "L", "XL", "XXL", "XXXL"},
        }

        valid = 0
        total = len(attributes)

        for attr in attributes:
            attr_key = attr.attribute_key
            value = attr.value.get("canonical") or attr.value.get("value")

            if attr_key in enum_attributes and value is not None:
                if str(value) in enum_attributes[attr_key]:
                    valid += 1
            elif value is not None and str(value).strip():
                valid += 1

        return valid / total if total > 0 else 0.5

    def _compute_consistency(
        self, attributes: list[AttributeRecord], product: CanonicalProduct
    ) -> tuple[float, list[str]]:
        issues: list[str] = []
        attr_map = {a.attribute_key: a.value.get("canonical") or a.value.get("value") for a in attributes}

        checks = 0
        passes = 0

        if "gender" in attr_map and "size" in attr_map:
            checks += 1
            passes += 1

        if "brand" in attr_map and product.identity.get("title"):
            checks += 1
            brand = str(attr_map["brand"]).lower()
            title_text = str(product.identity.get("title", "")).lower()
            if brand in title_text or len(brand) < 3:
                passes += 1
            else:
                issues.append(f"Brand '{attr_map['brand']}' not found in product title")

        for attr in attributes:
            if attr.extraction_type == ExtractionType.llm_generated and attr.confidence > 0.90:
                checks += 1
                issues.append(
                    f"Attribute '{attr.attribute_key}': LLM-generated with suspiciously high confidence {attr.confidence:.2f}"
                )
            else:
                checks += 1
                passes += 1

        consistency = passes / checks if checks > 0 else 1.0
        return consistency, issues

    def _compute_freshness(self, updated_at: Optional[datetime]) -> float:
        if not updated_at:
            return 0.30

        now = datetime.now(timezone.utc)
        if updated_at.tzinfo is None:
            updated_at = updated_at.replace(tzinfo=timezone.utc)

        days_old = (now - updated_at).days
        max_days = 180
        return max(0.0, 1.0 - (days_old / max_days))
