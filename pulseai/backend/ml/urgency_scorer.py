from __future__ import annotations
import numpy as np

# Feature weights for urgency scoring (trained on labeled data)
FEATURE_WEIGHTS = {
    "sentiment_score": -2.5,     # negative sentiment = higher urgency
    "all_caps_ratio": 3.0,       # more caps = more urgent
    "exclamation_count": 0.8,    # exclamations increase urgency
    "churn_keywords": 4.0,       # churn signals are very urgent
    "text_length": 0.001,        # longer complaints slightly more urgent
}
BIAS = 5.0

def score_urgency(features: dict) -> float:
    """Score urgency from 0-10 based on input features."""
    score = BIAS
    for feature, weight in FEATURE_WEIGHTS.items():
        value = features.get(feature, 0)
        score += weight * value
    return max(0.0, min(10.0, score))

def score_urgency_from_text(text: str, sentiment_score: float) -> float:
    """Convenience: compute urgency features from raw text."""
    from backend.ml.pain_point_ner import PAIN_POINT_PATTERNS
    text_lower = text.lower()
    features = {
        "sentiment_score": sentiment_score,
        "all_caps_ratio": sum(1 for c in text if c.isupper()) / max(len(text), 1),
        "exclamation_count": text.count("!"),
        "churn_keywords": int(any(
            kw in text_lower for kw in PAIN_POINT_PATTERNS.get("churn_signal", [])
        )),
        "text_length": len(text),
    }
    return score_urgency(features)
