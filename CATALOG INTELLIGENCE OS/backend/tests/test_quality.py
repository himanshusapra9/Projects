import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock

from app.services.quality_scorer import QualityScorer
from app.models.product import ExtractionType


def _make_attr(key: str, value: str, confidence: float = 0.95, approved: bool = True, extraction_type=ExtractionType.extracted):
    attr = MagicMock()
    attr.attribute_key = key
    attr.value = {"canonical": value}
    attr.confidence = confidence
    attr.is_approved = approved
    attr.extraction_type = extraction_type
    return attr


def _make_product(title: str = "Test Product", brand: str = "TestBrand", updated_at=None):
    product = MagicMock()
    product.identity = {"title": title, "brand": brand}
    product.updated_at = updated_at or datetime.now(timezone.utc)
    product.created_at = datetime.now(timezone.utc)
    return product


def _make_category(required=None, recommended=None):
    cat = MagicMock()
    cat.attribute_schema = {
        "required": required or ["color", "material", "size", "gender", "brand"],
        "recommended": recommended or ["fit", "sleeve_length"],
    }
    return cat


@pytest.fixture
def scorer():
    return QualityScorer()


@pytest.mark.asyncio
async def test_perfect_completeness(scorer):
    attrs = [
        _make_attr("color", "navy"),
        _make_attr("material", "Cotton"),
        _make_attr("size", "M"),
        _make_attr("gender", "Men"),
        _make_attr("brand", "TestBrand"),
    ]
    product = _make_product()
    category = _make_category()

    score = await scorer.score(product, attrs, category)
    assert score.completeness == 1.0
    assert len(score.missing_required) == 0


@pytest.mark.asyncio
async def test_partial_completeness(scorer):
    attrs = [
        _make_attr("color", "navy"),
        _make_attr("brand", "TestBrand"),
    ]
    product = _make_product()
    category = _make_category()

    score = await scorer.score(product, attrs, category)
    assert score.completeness == 0.4
    assert "material" in score.missing_required


@pytest.mark.asyncio
async def test_freshness_decay(scorer):
    old_date = datetime.now(timezone.utc) - timedelta(days=90)
    product = _make_product(updated_at=old_date)
    category = _make_category()

    score = await scorer.score(product, [], category)
    assert score.freshness == pytest.approx(0.5, abs=0.05)


@pytest.mark.asyncio
async def test_overall_score_range(scorer):
    attrs = [_make_attr("color", "navy"), _make_attr("brand", "TestBrand")]
    product = _make_product()
    category = _make_category()

    score = await scorer.score(product, attrs, category)
    assert 0.0 <= score.overall <= 1.0
