import json
import re
from typing import Any

import anthropic
from pydantic import BaseModel

from app.config import settings
from app.models.product import ExtractionType


class ExtractedAttribute(BaseModel):
    attribute_key: str
    raw_value: str
    canonical_value: Any
    confidence: float
    extraction_type: ExtractionType
    evidence: dict


class AttributeExtractor:
    LLM_CONFIDENCE = 0.78
    REGEX_CONFIDENCE = 0.99
    DICT_CONFIDENCE = 0.97
    INFERRED_BASE = 0.72

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self._build_dictionaries()
        self._build_regex_patterns()

    def _build_dictionaries(self):
        self.color_dict = {
            "black": ["black", "noir", "onyx", "jet", "charcoal black", "matte black"],
            "white": ["white", "blanc", "ivory", "cream", "off-white", "eggshell"],
            "navy": ["navy", "navy blue", "dark navy", "midnight blue", "midnight navy", "dark blue"],
            "red": ["red", "crimson", "scarlet", "cherry", "ruby", "burgundy"],
            "blue": ["blue", "cobalt", "royal blue", "sky blue", "cornflower", "cerulean"],
            "green": ["green", "olive", "forest green", "emerald", "sage", "hunter green"],
            "gray": ["gray", "grey", "silver", "slate", "charcoal", "ash"],
            "brown": ["brown", "tan", "camel", "cognac", "chocolate", "khaki"],
            "beige": ["beige", "sand", "nude", "stone", "taupe", "ecru"],
            "pink": ["pink", "rose", "blush", "mauve", "fuchsia", "coral"],
            "purple": ["purple", "violet", "lavender", "plum", "eggplant"],
            "yellow": ["yellow", "gold", "mustard", "lemon", "amber"],
            "orange": ["orange", "rust", "burnt orange", "copper", "terracotta"],
        }

        self.material_dict = {
            "Cotton": ["cotton", "100% cotton", "pure cotton", "cotton fabric", "pima cotton", "organic cotton"],
            "Polyester": ["polyester", "poly", "100% polyester", "microfiber", "microfibre"],
            "Wool": ["wool", "merino", "cashmere", "lambswool", "shetland wool"],
            "Leather": ["leather", "genuine leather", "full-grain leather", "top-grain leather", "vegan leather"],
            "Nylon": ["nylon", "nylon fabric"],
            "Linen": ["linen", "100% linen"],
            "Silk": ["silk", "100% silk", "pure silk"],
            "Denim": ["denim", "100% denim"],
            "Spandex": ["spandex", "elastane", "lycra"],
        }

        self.size_us_dict = {
            "XS": ["xs", "x-small", "xsmall", "extra small", "extra-small"],
            "S": ["sm", "small"],
            "M": ["md", "med", "medium"],
            "L": ["lg", "large"],
            "XL": ["xl", "x-large", "xlarge", "extra large", "extra-large"],
            "XXL": ["xxl", "2xl", "2x-large", "double extra large", "xx-large"],
            "XXXL": ["xxxl", "3xl", "3x-large", "triple extra large"],
        }

    def _build_regex_patterns(self):
        self.patterns = {
            "weight_lbs": r"(\d+\.?\d*)\s*(?:lbs?|pounds?)",
            "weight_kg": r"(\d+\.?\d*)\s*(?:kg|kilograms?)",
            "weight_oz": r"(\d+\.?\d*)\s*(?:oz|ounces?)",
            "weight_g": r"(\d+\.?\d*)\s*(?:g|grams?)\b",
            "dimension_inches": r"(\d+\.?\d*)\s*[xX×]\s*(\d+\.?\d*)\s*[xX×]?\s*(\d+\.?\d*)?\s*(?:in|inch|inches|\")",
            "dimension_cm": r"(\d+\.?\d*)\s*[xX×]\s*(\d+\.?\d*)\s*[xX×]?\s*(\d+\.?\d*)?\s*(?:cm|centimeters?)",
            "voltage": r"(\d+(?:-\d+)?)\s*[vV](?:olts?)?",
            "wattage": r"(\d+\.?\d*)\s*[wW](?:atts?)?",
            "battery_hours": r"(\d+)\s*(?:hour|hr)s?\s*(?:battery|batt)",
            "pack_size": r"(?:pack|set|bundle|lot)\s+of\s+(\d+)|(\d+)\s*(?:pack|piece|pcs?|count|ct\.?)\b",
            "frequency_hz": r"(\d+(?:\.\d+)?)\s*(?:Hz|KHz|kHz|MHz)",
        }

    async def extract_all(
        self,
        title: str,
        description: str,
        category_id: str,
        existing_fields: dict,
        source_id: str,
    ) -> list[ExtractedAttribute]:
        results = []

        pattern_results = self._extract_patterns(title, description, existing_fields)
        results.extend(pattern_results)

        dict_results = self._extract_from_dictionaries(title, description, existing_fields)
        results.extend(dict_results)

        found_keys = {r.attribute_key for r in results}

        category_schema = await self._get_category_schema(category_id)
        missing_required = [
            attr
            for attr in category_schema.get("required", [])
            if attr not in found_keys and attr not in existing_fields
        ]
        missing_recommended = [
            attr
            for attr in category_schema.get("recommended", [])
            if attr not in found_keys and attr not in existing_fields
        ]

        if missing_required or missing_recommended:
            llm_results = await self._extract_with_llm(
                title=title,
                description=description,
                category_id=category_id,
                missing_attributes=missing_required + missing_recommended[:3],
            )
            results.extend(llm_results)

        return results

    def _extract_patterns(self, title: str, description: str, existing: dict) -> list[ExtractedAttribute]:
        results = []
        combined_text = f"{title} {description}"

        for pattern_name, pattern in [
            ("weight_lbs", self.patterns["weight_lbs"]),
            ("weight_kg", self.patterns["weight_kg"]),
            ("weight_oz", self.patterns["weight_oz"]),
            ("weight_g", self.patterns["weight_g"]),
        ]:
            match = re.search(pattern, combined_text, re.IGNORECASE)
            if match:
                raw = float(match.group(1))
                if "lbs" in pattern_name:
                    weight_g = round(raw * 453.592)
                elif "kg" in pattern_name:
                    weight_g = round(raw * 1000)
                elif "oz" in pattern_name:
                    weight_g = round(raw * 28.3495)
                else:
                    weight_g = round(raw)

                source_field = "title" if match.group() in title else "description"
                results.append(
                    ExtractedAttribute(
                        attribute_key="weight_g",
                        raw_value=match.group(),
                        canonical_value=weight_g,
                        confidence=self.REGEX_CONFIDENCE,
                        extraction_type=ExtractionType.extracted,
                        evidence={
                            "source_text": match.group(),
                            "source_field": source_field,
                            "extraction_method": f"regex_{pattern_name}",
                            "conversion": f"{raw} {pattern_name.replace('weight_', '')} → {weight_g}g",
                        },
                    )
                )
                break

        volt_match = re.search(self.patterns["voltage"], combined_text, re.IGNORECASE)
        if volt_match:
            results.append(
                ExtractedAttribute(
                    attribute_key="voltage",
                    raw_value=volt_match.group(),
                    canonical_value=f"{volt_match.group(1)}V",
                    confidence=self.REGEX_CONFIDENCE,
                    extraction_type=ExtractionType.extracted,
                    evidence={
                        "source_text": volt_match.group(),
                        "source_field": "title" if volt_match.group() in title else "description",
                        "extraction_method": "regex_voltage",
                    },
                )
            )

        battery_match = re.search(self.patterns["battery_hours"], combined_text, re.IGNORECASE)
        if battery_match:
            results.append(
                ExtractedAttribute(
                    attribute_key="battery_life_hours",
                    raw_value=battery_match.group(),
                    canonical_value=int(battery_match.group(1)),
                    confidence=self.REGEX_CONFIDENCE,
                    extraction_type=ExtractionType.extracted,
                    evidence={
                        "source_text": battery_match.group(),
                        "source_field": "title" if battery_match.group() in title else "description",
                        "extraction_method": "regex_battery_hours",
                    },
                )
            )

        pack_match = re.search(self.patterns["pack_size"], combined_text, re.IGNORECASE)
        if pack_match:
            count = int(pack_match.group(1) or pack_match.group(2))
            results.append(
                ExtractedAttribute(
                    attribute_key="pack_size",
                    raw_value=pack_match.group(),
                    canonical_value=count,
                    confidence=self.REGEX_CONFIDENCE,
                    extraction_type=ExtractionType.extracted,
                    evidence={
                        "source_text": pack_match.group(),
                        "source_field": "title" if pack_match.group() in title else "description",
                        "extraction_method": "regex_pack_size",
                    },
                )
            )

        return results

    def _extract_from_dictionaries(
        self, title: str, description: str, existing: dict
    ) -> list[ExtractedAttribute]:
        results = []
        title_lower = title.lower()
        desc_lower = description.lower()
        combined_lower = f"{title_lower} {desc_lower}"

        if "color" not in existing:
            for canonical_color, aliases in self.color_dict.items():
                found = False
                for alias in aliases:
                    if alias in title_lower:
                        results.append(
                            ExtractedAttribute(
                                attribute_key="color",
                                raw_value=alias,
                                canonical_value=canonical_color,
                                confidence=self.DICT_CONFIDENCE,
                                extraction_type=ExtractionType.normalized,
                                evidence={
                                    "source_text": alias,
                                    "source_field": "title",
                                    "extraction_method": "color_dictionary",
                                    "canonical_mapping": f'"{alias}" → "{canonical_color}"',
                                },
                            )
                        )
                        found = True
                        break
                if found:
                    break

        if "material" not in existing:
            found_materials = []
            for canonical_mat, aliases in self.material_dict.items():
                for alias in aliases:
                    if alias in combined_lower:
                        pct_match = re.search(rf"(\d+)%\s*{re.escape(alias)}", combined_lower)
                        pct = int(pct_match.group(1)) if pct_match else None
                        found_materials.append({"fiber": canonical_mat, "percentage": pct, "raw": alias})
                        break

            if found_materials:
                results.append(
                    ExtractedAttribute(
                        attribute_key="material",
                        raw_value=", ".join(m["raw"] for m in found_materials),
                        canonical_value=found_materials,
                        confidence=self.DICT_CONFIDENCE,
                        extraction_type=ExtractionType.normalized,
                        evidence={
                            "source_text": ", ".join(m["raw"] for m in found_materials),
                            "source_field": "title_or_description",
                            "extraction_method": "material_dictionary",
                        },
                    )
                )

        if "size" not in existing:
            for canonical_size, aliases in self.size_us_dict.items():
                found = False
                for alias in aliases:
                    if re.search(rf"\b{re.escape(alias)}\b", title_lower, re.IGNORECASE):
                        results.append(
                            ExtractedAttribute(
                                attribute_key="size",
                                raw_value=alias,
                                canonical_value={"value": canonical_size, "system": "US"},
                                confidence=self.DICT_CONFIDENCE,
                                extraction_type=ExtractionType.normalized,
                                evidence={
                                    "source_text": alias,
                                    "source_field": "title",
                                    "extraction_method": "size_dictionary_us",
                                    "canonical_mapping": f'"{alias}" → "{canonical_size}" (US)',
                                },
                            )
                        )
                        found = True
                        break
                if found:
                    break

        if "gender" not in existing:
            men_keywords = ["men's", "mens", " men ", "male", "him", "his"]
            women_keywords = ["women's", "womens", "woman's", "female", "ladies"]
            if any(kw in title_lower for kw in men_keywords):
                matched = next((kw for kw in men_keywords if kw in title_lower), "men's")
                results.append(
                    ExtractedAttribute(
                        attribute_key="gender",
                        raw_value="men's",
                        canonical_value="Men",
                        confidence=0.97,
                        extraction_type=ExtractionType.extracted,
                        evidence={
                            "source_text": matched,
                            "source_field": "title",
                            "extraction_method": "gender_keyword",
                        },
                    )
                )
            elif any(kw in title_lower for kw in women_keywords):
                matched = next((kw for kw in women_keywords if kw in title_lower), "women's")
                results.append(
                    ExtractedAttribute(
                        attribute_key="gender",
                        raw_value="women's",
                        canonical_value="Women",
                        confidence=0.97,
                        extraction_type=ExtractionType.extracted,
                        evidence={
                            "source_text": matched,
                            "source_field": "title",
                            "extraction_method": "gender_keyword",
                        },
                    )
                )

        if "brand" not in existing:
            brand_match = re.match(r"^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)", title)
            if brand_match:
                results.append(
                    ExtractedAttribute(
                        attribute_key="brand",
                        raw_value=brand_match.group(1),
                        canonical_value=brand_match.group(1),
                        confidence=0.82,
                        extraction_type=ExtractionType.extracted,
                        evidence={
                            "source_text": brand_match.group(1),
                            "source_field": "title",
                            "extraction_method": "brand_title_prefix_heuristic",
                        },
                    )
                )

        return results

    async def _extract_with_llm(
        self,
        title: str,
        description: str,
        category_id: str,
        missing_attributes: list[str],
    ) -> list[ExtractedAttribute]:
        if not missing_attributes:
            return []

        attribute_descriptions = {
            "fit": "How the garment fits the body (Classic Fit, Slim Fit, Relaxed Fit, Athletic Fit, Regular Fit)",
            "sleeve_length": "Length of sleeves (Short Sleeve, Long Sleeve, 3/4 Sleeve, Sleeveless)",
            "collar_type": "Type of collar (Polo Collar, Crew Neck, V-Neck, Turtleneck, Spread Collar)",
            "care_instructions": "How to clean the item (Machine Washable, Hand Wash Only, Dry Clean Only)",
            "connection_type": "How device connects (Bluetooth, Wired, USB-C, Wireless, Wi-Fi)",
            "noise_cancellation": "Type of noise cancellation (Active Noise Cancellation, Passive, None)",
            "water_resistance": "Water resistance rating (IPX4, IPX7, Waterproof, Water Resistant, None)",
            "age_group": "Target age group (Infant, Toddler, Kids, Teen, Adult, Senior)",
            "country_of_origin": "Country where product was manufactured",
            "warranty_period": "Manufacturer warranty duration (1 Year, 2 Years, 90 Days, Lifetime)",
        }

        attr_schema = {
            attr: attribute_descriptions.get(attr, f"The product's {attr.replace('_', ' ')}")
            for attr in missing_attributes
        }

        system_prompt = (
            "You are a product data extraction specialist with expert knowledge "
            "in structured attribute extraction from commerce product listings.\n\n"
            "Your job: Extract structured product attributes from the provided product information.\n\n"
            "STRICT RULES:\n"
            "1. Only extract values EXPLICITLY stated or directly implied in the provided text\n"
            "2. If a value is not clearly present, return null for that field — never guess\n"
            "3. Never invent specifications, features, or characteristics\n"
            "4. For each extracted value, provide the exact source text phrase as evidence\n"
            "5. Values must be specific and canonical (e.g., \"Short Sleeve\" not \"short\")\n"
            "6. Prefer title information over description when there is a conflict"
        )

        user_prompt = (
            f"Extract these attributes from the product listing below.\n\n"
            f"PRODUCT TITLE: {title}\n"
            f"PRODUCT DESCRIPTION: {description}\n\n"
            f"ATTRIBUTES TO EXTRACT:\n{json.dumps(attr_schema, indent=2)}\n\n"
            "Respond with a JSON object with this exact structure:\n"
            "{\n"
            '  "extractions": [\n'
            "    {\n"
            '      "attribute_key": "<attribute name>",\n'
            '      "value": "<extracted canonical value or null>",\n'
            '      "confidence": <0.0 to 1.0, based on how clearly the value is stated>,\n'
            '      "evidence_text": "<exact phrase from source that supports this, or null if value is null>"\n'
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Only include attributes where you found a value. Do not include attributes with null values."
        )

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )

            response_text = response.content[0].text
            json_match = re.search(r"\{[\s\S]*\}", response_text)
            if not json_match:
                return []

            parsed = json.loads(json_match.group())
            results = []

            for extraction in parsed.get("extractions", []):
                if extraction.get("value") is None:
                    continue

                attr_key = extraction["attribute_key"]
                value = extraction["value"]
                confidence = float(extraction.get("confidence", self.LLM_CONFIDENCE))
                evidence_text = extraction.get("evidence_text", "")

                calibrated_confidence = min(confidence * 0.88, 0.88)

                results.append(
                    ExtractedAttribute(
                        attribute_key=attr_key,
                        raw_value=str(value),
                        canonical_value=value,
                        confidence=calibrated_confidence,
                        extraction_type=ExtractionType.llm_generated,
                        evidence={
                            "source_text": evidence_text,
                            "source_field": "title_or_description",
                            "extraction_method": "llm_claude_sonnet",
                            "model": "claude-sonnet-4-5",
                            "raw_confidence": confidence,
                            "calibrated_confidence": calibrated_confidence,
                        },
                    )
                )

            return results

        except Exception as e:
            print(f"LLM extraction failed: {e}")
            return []

    async def _get_category_schema(self, category_id: str) -> dict:
        schema_map = {
            "cat_apparel_men_shirts_polo": {
                "required": ["color", "material", "size", "gender", "brand"],
                "recommended": ["fit", "sleeve_length", "collar_type", "care_instructions", "country_of_origin"],
            },
            "cat_electronics_audio_headphones": {
                "required": ["brand", "color", "connection_type", "noise_cancellation"],
                "recommended": ["battery_life_hours", "weight_g", "water_resistance", "warranty_period"],
            },
            "cat_electronics_phones_smartphones": {
                "required": ["brand", "color", "storage_gb"],
                "recommended": ["battery_life_hours", "screen_size_inches", "operating_system", "weight_g"],
            },
            "cat_beauty_skincare": {
                "required": ["brand", "skin_type", "volume_ml"],
                "recommended": ["key_ingredients", "spf", "fragrance_free", "age_group"],
            },
        }
        return schema_map.get(category_id, {"required": ["brand"], "recommended": []})
