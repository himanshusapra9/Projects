from __future__ import annotations

from datetime import datetime

from backend.ml.pain_point_ner import extract_pain_points
from backend.ml.sentiment import analyze_sentiment_mock as analyze_sentiment
from backend.ml.topic_classifier import classify_topics_mock as classify_topics
from backend.ml.urgency_scorer import score_urgency
from backend.models.feedback import FeedbackItem, ProcessedFeedback

TOPIC_LABELS = [
    "onboarding",
    "billing",
    "performance",
    "integrations",
    "mobile",
    "search",
    "notifications",
    "security",
    "export",
    "api",
    "support",
    "pricing",
    "documentation",
    "ui_ux",
]


def process_feedback(item: FeedbackItem) -> ProcessedFeedback:
    text = item.text[:512]
    sentiment = analyze_sentiment(text)
    topics = classify_topics(text, TOPIC_LABELS, threshold=0.3)
    pain_points = extract_pain_points(text)

    text_lower = text.lower()
    from backend.ml.pain_point_ner import PAIN_POINT_PATTERNS

    urgency = score_urgency(
        {
            "sentiment_score": sentiment["polarity"],
            "all_caps_ratio": sum(1 for c in text if c.isupper()) / max(len(text), 1),
            "exclamation_count": text.count("!"),
            "churn_keywords": int(
                any(
                    kw in text_lower
                    for kw in PAIN_POINT_PATTERNS.get("churn_signal", [])
                )
            ),
            "text_length": len(text),
        }
    )

    return ProcessedFeedback(
        original=item,
        sentiment_label=sentiment["label"],
        sentiment_score=sentiment["polarity"],
        topics=topics,
        pain_points=pain_points,
        urgency_score=urgency,
        processed_at=datetime.utcnow().isoformat(),
    )
