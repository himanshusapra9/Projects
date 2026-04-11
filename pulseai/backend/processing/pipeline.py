from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from backend.ml.pain_point_ner import extract_pain_points
from backend.ml.sentiment import analyze_sentiment_mock as analyze_sentiment
from backend.ml.topic_classifier import classify_topics_mock as classify_topics
from backend.ml.urgency_scorer import score_urgency
from backend.models.feedback import FeedbackItem, ProcessedFeedback

logger = logging.getLogger("pulseai.pipeline")

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
    """Synchronous pipeline — kept intact for existing tests and batch use."""
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


async def analyze_realtime(signal: dict) -> dict:
    """
    Async pipeline that runs Groq LLM analysis in parallel with heuristic scorers.
    Falls back to heuristic-only if Groq is unavailable.
    """
    text = signal.get("text", "")[:512]

    from backend.ml.groq_client import GroqClient

    groq_available = GroqClient().available

    heuristic_sentiment = analyze_sentiment(text)
    heuristic_topics = classify_topics(text, TOPIC_LABELS, threshold=0.3)
    heuristic_pain_points = extract_pain_points(text)

    text_lower = text.lower()
    from backend.ml.pain_point_ner import PAIN_POINT_PATTERNS

    urgency = score_urgency(
        {
            "sentiment_score": heuristic_sentiment["polarity"],
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

    result = {
        "text": text,
        "sentiment": {"label": heuristic_sentiment["label"], "score": heuristic_sentiment["polarity"]},
        "topics": heuristic_topics,
        "pain_points": heuristic_pain_points,
        "urgency_score": urgency,
        "source": signal.get("source_platform", "unknown"),
        "processed_at": datetime.utcnow().isoformat(),
        "analysis_mode": "heuristic",
    }

    if groq_available:
        try:
            from backend.ml.groq_analyzer import (
                analyze_sentiment as groq_sentiment,
                analyze_topics as groq_topics,
                extract_pain_points as groq_pain_points,
            )

            groq_results = await asyncio.gather(
                groq_sentiment(text),
                groq_topics(text),
                groq_pain_points(text),
                return_exceptions=True,
            )

            sent, topics, pains = groq_results

            if isinstance(sent, dict):
                result["sentiment"] = {
                    "label": sent.get("sentiment", heuristic_sentiment["label"]),
                    "score": sent.get("confidence", heuristic_sentiment["polarity"]),
                    "reasoning": sent.get("reasoning", ""),
                }
            if isinstance(topics, dict):
                result["topics"] = topics.get("topics", heuristic_topics)
                result["primary_topic"] = topics.get("primary_topic", "")
            if isinstance(pains, dict):
                result["pain_points_llm"] = pains.get("pain_points", [])
                result["churn_risk"] = pains.get("churn_risk", "low")
                if pains.get("urgency_score"):
                    result["urgency_score"] = (urgency + float(pains["urgency_score"])) / 2

            result["analysis_mode"] = "groq_enhanced"
        except Exception as exc:
            logger.warning("Groq realtime analysis failed, using heuristic: %s", exc)

    from backend.processing.event_bus import broadcast_signal

    await broadcast_signal(result)
    return result
