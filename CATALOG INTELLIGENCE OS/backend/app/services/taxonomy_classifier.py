from pydantic import BaseModel


class TaxonomyPrediction(BaseModel):
    category_id: str
    category_path: list[str]
    category_name: str
    confidence: float
    evidence: dict


class TaxonomyClassifier:
    AUTO_APPROVE_THRESHOLD = 0.90
    REVIEW_THRESHOLD = 0.70

    def __init__(self):
        self.category_keywords = self._build_keyword_index()

    def _build_keyword_index(self) -> dict[str, list[str]]:
        return {
            "cat_apparel_men_shirts_polo": [
                "polo", "polo shirt", "men's polo", "pique", "collar shirt"
            ],
            "cat_apparel_men_shirts_dress": [
                "dress shirt", "button down", "button-down", "oxford shirt", "formal shirt"
            ],
            "cat_apparel_women_dresses": [
                "dress", "maxi dress", "midi dress", "cocktail dress", "sundress"
            ],
            "cat_apparel_men_pants": [
                "pants", "trousers", "chinos", "slacks", "men's bottoms"
            ],
            "cat_electronics_audio_headphones": [
                "headphones", "over-ear", "on-ear", "headset", "earphones",
                "wh-1000", "bose 700", "studio pro"
            ],
            "cat_electronics_audio_earbuds": [
                "earbuds", "in-ear", "tws", "airpods", "galaxy buds", "truly wireless"
            ],
            "cat_electronics_computers_laptops": [
                "laptop", "notebook", "macbook", "thinkpad", "chromebook"
            ],
            "cat_electronics_phones_smartphones": [
                "smartphone", "iphone", "android", "mobile phone", "cell phone", "galaxy s"
            ],
            "cat_home_furniture_sofas": [
                "sofa", "couch", "sectional", "loveseat", "chesterfield"
            ],
            "cat_home_kitchen_appliances": [
                "blender", "toaster", "coffee maker", "air fryer", "instant pot", "microwave"
            ],
            "cat_beauty_skincare": [
                "moisturizer", "serum", "cleanser", "toner", "sunscreen", "retinol", "spf"
            ],
            "cat_beauty_makeup": [
                "foundation", "lipstick", "mascara", "eyeshadow", "concealer", "blush"
            ],
            "cat_tools_power_drills": [
                "drill", "cordless drill", "hammer drill", "drill driver", "impact driver"
            ],
            "cat_sports_running_shoes": [
                "running shoes", "trainers", "sneakers", "athletic shoes", "running"
            ],
        }

    async def classify(
        self,
        title: str,
        description: str = "",
        top_k: int = 3,
    ) -> list[TaxonomyPrediction]:
        text_lower = f"{title} {description}".lower()
        title_lower = title.lower()

        scores: dict[str, float] = {}
        evidence: dict[str, dict] = {}

        for cat_id, keywords in self.category_keywords.items():
            score = 0.0
            matched_keywords = []

            for kw in keywords:
                if kw in title_lower:
                    score += 2.0
                    matched_keywords.append({"keyword": kw, "location": "title", "weight": 2.0})
                elif kw in text_lower:
                    score += 1.0
                    matched_keywords.append({"keyword": kw, "location": "description", "weight": 1.0})

            if score > 0:
                scores[cat_id] = score
                evidence[cat_id] = {
                    "matched_keywords": matched_keywords,
                    "raw_score": score,
                    "method": "keyword_matching_mvp",
                }

        if not scores:
            return [
                TaxonomyPrediction(
                    category_id="cat_uncategorized",
                    category_path=["Uncategorized"],
                    category_name="Uncategorized",
                    confidence=0.10,
                    evidence={"reason": "No keywords matched any known category"},
                )
            ]

        max_score = max(scores.values())
        normalized: list[tuple[str, float]] = [
            (cat_id, min(score / max_score * 0.88, 0.97))
            for cat_id, score in scores.items()
        ]
        normalized.sort(key=lambda x: x[1], reverse=True)

        results = []
        for cat_id, confidence in normalized[:top_k]:
            category_info = self._get_category_info(cat_id)
            results.append(
                TaxonomyPrediction(
                    category_id=cat_id,
                    category_path=category_info["path"],
                    category_name=category_info["name"],
                    confidence=round(confidence, 4),
                    evidence=evidence[cat_id],
                )
            )

        return results

    def _get_category_info(self, cat_id: str) -> dict:
        category_map = {
            "cat_apparel_men_shirts_polo": {
                "path": ["Apparel", "Men", "Shirts", "Polo Shirts"],
                "name": "Polo Shirts",
            },
            "cat_apparel_men_shirts_dress": {
                "path": ["Apparel", "Men", "Shirts", "Dress Shirts"],
                "name": "Dress Shirts",
            },
            "cat_apparel_women_dresses": {
                "path": ["Apparel", "Women", "Dresses"],
                "name": "Dresses",
            },
            "cat_apparel_men_pants": {
                "path": ["Apparel", "Men", "Pants & Trousers"],
                "name": "Pants & Trousers",
            },
            "cat_electronics_audio_headphones": {
                "path": ["Electronics", "Audio", "Headphones", "Over-Ear"],
                "name": "Over-Ear Headphones",
            },
            "cat_electronics_audio_earbuds": {
                "path": ["Electronics", "Audio", "Headphones", "Earbuds"],
                "name": "Earbuds & In-Ear",
            },
            "cat_electronics_computers_laptops": {
                "path": ["Electronics", "Computers", "Laptops"],
                "name": "Laptops",
            },
            "cat_electronics_phones_smartphones": {
                "path": ["Electronics", "Phones", "Smartphones"],
                "name": "Smartphones",
            },
            "cat_home_furniture_sofas": {
                "path": ["Home & Garden", "Furniture", "Living Room", "Sofas & Couches"],
                "name": "Sofas & Couches",
            },
            "cat_home_kitchen_appliances": {
                "path": ["Home & Garden", "Kitchen", "Appliances"],
                "name": "Kitchen Appliances",
            },
            "cat_beauty_skincare": {
                "path": ["Beauty", "Skin Care"],
                "name": "Skin Care",
            },
            "cat_beauty_makeup": {
                "path": ["Beauty", "Makeup"],
                "name": "Makeup",
            },
            "cat_tools_power_drills": {
                "path": ["Tools & Home Improvement", "Power Tools", "Drills"],
                "name": "Drills",
            },
            "cat_sports_running_shoes": {
                "path": ["Sports & Outdoors", "Footwear", "Running Shoes"],
                "name": "Running Shoes",
            },
        }
        return category_map.get(cat_id, {"path": ["Unknown"], "name": "Unknown"})

    def should_auto_approve(self, confidence: float) -> bool:
        return confidence >= self.AUTO_APPROVE_THRESHOLD

    def should_flag_for_review(self, confidence: float) -> bool:
        return confidence < self.REVIEW_THRESHOLD
