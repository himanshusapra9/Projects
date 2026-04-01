from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.taxonomy import TaxonomyNode
from app.models.supplier import Supplier
from app.models.product import SourceRecord


TAXONOMY_NODES = [
    {
        "id": "cat_apparel_men_shirts_polo",
        "name": "Polo Shirts",
        "path": ["Apparel", "Men", "Shirts", "Polo Shirts"],
        "depth": 3,
        "parent_id": None,
        "attribute_schema": {
            "required": ["color", "material", "size", "gender", "brand"],
            "recommended": ["fit", "sleeve_length", "collar_type", "care_instructions", "country_of_origin"],
            "optional": ["country_of_origin"],
        },
    },
    {
        "id": "cat_apparel_men_shirts_dress",
        "name": "Dress Shirts",
        "path": ["Apparel", "Men", "Shirts", "Dress Shirts"],
        "depth": 3,
        "parent_id": None,
        "attribute_schema": {
            "required": ["color", "material", "size", "gender", "brand"],
            "recommended": ["fit", "collar_type", "sleeve_length", "care_instructions"],
        },
    },
    {
        "id": "cat_apparel_women_dresses",
        "name": "Dresses",
        "path": ["Apparel", "Women", "Dresses"],
        "depth": 2,
        "parent_id": None,
        "attribute_schema": {
            "required": ["color", "material", "size", "gender", "brand"],
            "recommended": ["fit", "sleeve_length", "length", "occasion"],
        },
    },
    {
        "id": "cat_apparel_men_pants",
        "name": "Pants & Trousers",
        "path": ["Apparel", "Men", "Pants & Trousers"],
        "depth": 2,
        "parent_id": None,
        "attribute_schema": {
            "required": ["color", "material", "size", "gender", "brand"],
            "recommended": ["fit", "inseam", "rise", "closure_type"],
        },
    },
    {
        "id": "cat_electronics_audio_headphones",
        "name": "Over-Ear Headphones",
        "path": ["Electronics", "Audio", "Headphones", "Over-Ear"],
        "depth": 3,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "color", "connection_type", "noise_cancellation"],
            "recommended": ["battery_life_hours", "weight_g", "water_resistance", "warranty_period"],
        },
    },
    {
        "id": "cat_electronics_audio_earbuds",
        "name": "Earbuds & In-Ear",
        "path": ["Electronics", "Audio", "Headphones", "Earbuds"],
        "depth": 3,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "color", "connection_type"],
            "recommended": ["battery_life_hours", "water_resistance", "noise_cancellation"],
        },
    },
    {
        "id": "cat_electronics_computers_laptops",
        "name": "Laptops",
        "path": ["Electronics", "Computers", "Laptops"],
        "depth": 2,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "screen_size_inches", "processor", "ram_gb"],
            "recommended": ["storage_gb", "operating_system", "weight_g", "battery_life_hours"],
        },
    },
    {
        "id": "cat_electronics_phones_smartphones",
        "name": "Smartphones",
        "path": ["Electronics", "Phones", "Smartphones"],
        "depth": 2,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "color", "storage_gb"],
            "recommended": ["battery_life_hours", "screen_size_inches", "operating_system", "weight_g"],
        },
    },
    {
        "id": "cat_home_furniture_sofas",
        "name": "Sofas & Couches",
        "path": ["Home & Garden", "Furniture", "Living Room", "Sofas & Couches"],
        "depth": 3,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "color", "material"],
            "recommended": ["seating_capacity", "dimensions", "weight_lbs"],
        },
    },
    {
        "id": "cat_home_kitchen_appliances",
        "name": "Kitchen Appliances",
        "path": ["Home & Garden", "Kitchen", "Appliances"],
        "depth": 2,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "color", "wattage"],
            "recommended": ["voltage", "weight_g", "dimensions", "warranty_period"],
        },
    },
    {
        "id": "cat_beauty_skincare",
        "name": "Skin Care",
        "path": ["Beauty", "Skin Care"],
        "depth": 1,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "skin_type", "volume_ml"],
            "recommended": ["key_ingredients", "spf", "fragrance_free", "age_group"],
        },
    },
    {
        "id": "cat_beauty_makeup",
        "name": "Makeup",
        "path": ["Beauty", "Makeup"],
        "depth": 1,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "color", "finish"],
            "recommended": ["coverage", "skin_type", "spf"],
        },
    },
    {
        "id": "cat_tools_power_drills",
        "name": "Drills",
        "path": ["Tools & Home Improvement", "Power Tools", "Drills"],
        "depth": 2,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "voltage", "drill_type"],
            "recommended": ["weight_g", "battery_type", "chuck_size", "torque"],
        },
    },
    {
        "id": "cat_sports_running_shoes",
        "name": "Running Shoes",
        "path": ["Sports & Outdoors", "Footwear", "Running Shoes"],
        "depth": 2,
        "parent_id": None,
        "attribute_schema": {
            "required": ["brand", "color", "size", "gender"],
            "recommended": ["cushioning_type", "arch_type", "weight_g", "surface_type"],
        },
    },
]

SUPPLIERS = [
    {
        "id": "acme_apparel",
        "name": "Acme Apparel Co.",
        "trust_scores": {"title": 0.85, "color": 0.92, "dimensions": 0.45},
    },
    {
        "id": "techworld_dist",
        "name": "TechWorld Distribution",
        "trust_scores": {"title": 0.90, "brand": 0.95, "specs": 0.88},
    },
    {
        "id": "homegoods_co",
        "name": "HomeGoods Company",
        "trust_scores": {"title": 0.78, "color": 0.80, "material": 0.72},
    },
]

SAMPLE_PRODUCTS = [
    {
        "supplier_id": "acme_apparel",
        "raw_fields": {
            "title": "Acme Apparel Men's Classic Fit Navy Polo Shirt - Medium, 100% Cotton",
            "description": "Premium men's polo shirt in classic fit. Made from 100% pima cotton pique fabric. Features a ribbed collar, two-button placket, and split hem. Machine washable. Available in multiple colors.",
            "sku": "ACME-POLO-NVY-M",
            "brand": "Acme Apparel",
            "price": 49.99,
            "gtin": "012345678901",
            "category": "Men > Shirts > Polos",
        },
    },
    {
        "supplier_id": "techworld_dist",
        "raw_fields": {
            "title": "Sony WH-1000XM5 Wireless Noise Cancelling Over-Ear Headphones - Black",
            "description": "Industry-leading noise cancellation with Auto NC Optimizer. 30 hours battery life. Crystal clear hands-free calling with 4 beamforming microphones. Multipoint connection. Weight: 250g. Bluetooth 5.2.",
            "sku": "SONY-WH1000XM5-BLK",
            "brand": "Sony",
            "price": 349.99,
            "gtin": "027242923782",
        },
    },
    {
        "supplier_id": "homegoods_co",
        "raw_fields": {
            "title": "Breville Barista Express Espresso Machine - Stainless Steel",
            "description": "Built-in conical burr grinder. 1850W ThermoJet heating system. 54mm portafilter. 2 liter water tank. PID temperature control for precise extraction temperature. Dimensions: 13.7 x 12.5 x 15.8 inches.",
            "sku": "BRV-BES870XL",
            "brand": "Breville",
            "price": 699.95,
        },
    },
    {
        "supplier_id": "acme_apparel",
        "raw_fields": {
            "title": "Women's Floral Midi Dress - Rose Pink, Small",
            "description": "Beautiful floral print midi dress perfect for spring. Lightweight chiffon fabric with lining. V-neckline, flutter sleeves, and elastic waist. Length: 42 inches. Dry clean only.",
            "sku": "ACME-DRESS-FLR-S",
            "brand": "Acme Apparel",
            "price": 79.50,
        },
    },
    {
        "supplier_id": "techworld_dist",
        "raw_fields": {
            "title": "DeWalt 20V MAX Cordless Drill/Driver Kit - Yellow/Black",
            "description": "High-performance motor delivers 300 unit watts out of max power. 2-speed transmission (0-450/0-1500 RPM). 1/2 inch single-sleeve ratcheting chuck. Includes two 20V MAX 1.3Ah batteries, charger, and kit bag. Weight: 3.5 lbs.",
            "sku": "DW-DCD771C2",
            "brand": "DeWalt",
            "price": 99.00,
            "upc": "885911460453",
        },
    },
]


async def seed_database(session: AsyncSession):
    existing = await session.execute(select(TaxonomyNode).limit(1))
    if existing.scalar_one_or_none():
        return None

    for node_data in TAXONOMY_NODES:
        node = TaxonomyNode(**node_data)
        session.add(node)

    for sup_data in SUPPLIERS:
        supplier = Supplier(**sup_data)
        session.add(supplier)

    await session.flush()

    source_record_ids = []
    for prod_data in SAMPLE_PRODUCTS:
        record = SourceRecord(
            id=str(uuid4()),
            supplier_id=prod_data["supplier_id"],
            raw_fields=prod_data["raw_fields"],
            supplier_category=prod_data["raw_fields"].get("category"),
            processing_status="pending",
        )
        session.add(record)
        source_record_ids.append(record.id)

    await session.commit()

    return source_record_ids
