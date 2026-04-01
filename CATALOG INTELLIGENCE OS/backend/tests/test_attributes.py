import pytest
from app.services.attribute_extractor import AttributeExtractor


@pytest.fixture
def extractor():
    return AttributeExtractor()


def test_extract_weight_lbs(extractor):
    results = extractor._extract_patterns(
        title="Heavy Duty Widget - 3.5 lbs",
        description="Solid construction",
        existing={},
    )
    weight_attrs = [r for r in results if r.attribute_key == "weight_g"]
    assert len(weight_attrs) == 1
    assert weight_attrs[0].canonical_value == round(3.5 * 453.592)
    assert weight_attrs[0].confidence == 0.99


def test_extract_weight_kg(extractor):
    results = extractor._extract_patterns(
        title="Lightweight at 1.5 kg",
        description="",
        existing={},
    )
    weight_attrs = [r for r in results if r.attribute_key == "weight_g"]
    assert len(weight_attrs) == 1
    assert weight_attrs[0].canonical_value == 1500


def test_extract_color_from_title(extractor):
    results = extractor._extract_from_dictionaries(
        title="Men's Navy Blue Polo Shirt",
        description="Classic style",
        existing={},
    )
    color_attrs = [r for r in results if r.attribute_key == "color"]
    assert len(color_attrs) == 1
    assert color_attrs[0].canonical_value == "navy"


def test_extract_material(extractor):
    results = extractor._extract_from_dictionaries(
        title="100% Cotton Polo",
        description="Made from premium pima cotton with spandex blend",
        existing={},
    )
    material_attrs = [r for r in results if r.attribute_key == "material"]
    assert len(material_attrs) == 1
    assert any(m["fiber"] == "Cotton" for m in material_attrs[0].canonical_value)


def test_extract_gender(extractor):
    results = extractor._extract_from_dictionaries(
        title="Men's Classic Fit Shirt",
        description="",
        existing={},
    )
    gender_attrs = [r for r in results if r.attribute_key == "gender"]
    assert len(gender_attrs) == 1
    assert gender_attrs[0].canonical_value == "Men"


def test_extract_brand(extractor):
    results = extractor._extract_from_dictionaries(
        title="Acme Apparel Men's Polo",
        description="",
        existing={},
    )
    brand_attrs = [r for r in results if r.attribute_key == "brand"]
    assert len(brand_attrs) == 1
    assert brand_attrs[0].canonical_value == "Acme Apparel"


def test_does_not_extract_existing(extractor):
    results = extractor._extract_from_dictionaries(
        title="Navy Polo Shirt",
        description="",
        existing={"color": "navy"},
    )
    color_attrs = [r for r in results if r.attribute_key == "color"]
    assert len(color_attrs) == 0


def test_extract_voltage(extractor):
    results = extractor._extract_patterns(
        title="20V MAX Drill",
        description="Powerful cordless drill",
        existing={},
    )
    voltage_attrs = [r for r in results if r.attribute_key == "voltage"]
    assert len(voltage_attrs) == 1
    assert "20" in voltage_attrs[0].canonical_value
