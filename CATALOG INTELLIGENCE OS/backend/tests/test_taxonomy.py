import pytest
from app.services.taxonomy_classifier import TaxonomyClassifier


@pytest.fixture
def classifier():
    return TaxonomyClassifier()


@pytest.mark.asyncio
async def test_classify_polo_shirt(classifier):
    predictions = await classifier.classify(
        title="Men's Classic Fit Navy Polo Shirt",
        description="Premium cotton polo shirt for men",
    )
    assert len(predictions) > 0
    assert predictions[0].category_id == "cat_apparel_men_shirts_polo"
    assert predictions[0].confidence > 0.70


@pytest.mark.asyncio
async def test_classify_headphones(classifier):
    predictions = await classifier.classify(
        title="Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        description="Over-ear headphones with industry-leading noise cancellation",
    )
    assert len(predictions) > 0
    assert predictions[0].category_id == "cat_electronics_audio_headphones"


@pytest.mark.asyncio
async def test_classify_unknown_product(classifier):
    predictions = await classifier.classify(
        title="Mysterious Widget XYZ-9000",
        description="A completely unknown product type",
    )
    assert len(predictions) > 0
    assert predictions[0].category_id == "cat_uncategorized"
    assert predictions[0].confidence < 0.50


@pytest.mark.asyncio
async def test_classify_returns_top_k(classifier):
    predictions = await classifier.classify(
        title="Polo collar shirt for men",
        description="Classic polo style dress shirt",
        top_k=3,
    )
    assert len(predictions) <= 3


def test_auto_approve_threshold(classifier):
    assert classifier.should_auto_approve(0.95) is True
    assert classifier.should_auto_approve(0.90) is True
    assert classifier.should_auto_approve(0.89) is False


def test_review_threshold(classifier):
    assert classifier.should_flag_for_review(0.60) is True
    assert classifier.should_flag_for_review(0.70) is False
    assert classifier.should_flag_for_review(0.80) is False
