from __future__ import annotations

PAIN_POINT_PATTERNS: dict[str, list[str]] = {
    "bug": ["broken", "not working", "error", "crash", "bug", "issue", "fail", "glitch"],
    "feature_request": ["would love", "wish", "please add", "missing", "need", "want"],
    "churn_signal": ["cancel", "switching", "competitor", "leaving", "refund", "unsubscribe"],
    "pricing_complaint": ["expensive", "too much", "overpriced", "not worth", "cheaper"],
    "competitor_mention": ["vs", "compared to", "better than", "like X does", "switched to"],
}

def extract_pain_points(text: str) -> list[dict]:
    text_lower = text.lower()
    found = []
    for category, keywords in PAIN_POINT_PATTERNS.items():
        matched_keywords = [kw for kw in keywords if kw in text_lower]
        if matched_keywords:
            found.append({
                "category": category,
                "keywords_matched": matched_keywords,
                "confidence": min(1.0, len(matched_keywords) * 0.3 + 0.4),
            })
    return found
