from __future__ import annotations

import json
import logging

from backend.ml.groq_client import GroqClient

logger = logging.getLogger("pulseai.groq_analyzer")

SENTIMENT_SYSTEM = (
    'You are a sentiment classifier. Return ONLY valid JSON: '
    '{"sentiment": "positive"|"negative"|"neutral", "confidence": 0.0-1.0, '
    '"reasoning": "one sentence"}'
)

TOPICS_SYSTEM = (
    'You are a topic classifier for a SaaS product. Return ONLY valid JSON: '
    '{"topics": ["billing"|"performance"|"ui"|"api"|"onboarding"|"support"|'
    '"feature_request"|"bug"], "primary_topic": "...", "confidence": 0.0-1.0}'
)

PAIN_POINTS_SYSTEM = (
    'Extract customer pain points. Return ONLY valid JSON: '
    '{"pain_points": [{"type": "bug"|"feature_request"|"churn_signal"|'
    '"pricing"|"competitor", "description": "...", "severity": 1-5}], '
    '"churn_risk": "low"|"medium"|"high", "urgency_score": 0-10}'
)

TRANSACTION_SYSTEM = (
    "You are a customer behavior analyst. Given transaction history, identify "
    "behavioral patterns. Return ONLY valid JSON: "
    '{"behavior_type": "power_user"|"casual"|"at_risk"|"new"|"churned", '
    '"engagement_trend": "growing"|"stable"|"declining", '
    '"key_signals": ["..."], '
    '"next_action_recommendation": "...", '
    '"predicted_ltv_bucket": "low"|"medium"|"high"}'
)


def _safe_parse(raw: str, defaults: dict) -> dict:
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(raw[start:end])
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("JSON parse failed: %s — raw[:200]=%s", exc, raw[:200])
    return defaults


async def analyze_sentiment(text: str) -> dict:
    client = GroqClient()
    if not client.available:
        return {"sentiment": "neutral", "confidence": 0.0, "reasoning": "groq unavailable"}
    try:
        raw = await client.analyze(prompt=text, system=SENTIMENT_SYSTEM)
        return _safe_parse(raw, {"sentiment": "neutral", "confidence": 0.0, "reasoning": "parse error"})
    except Exception as exc:
        logger.error("analyze_sentiment error: %s", exc)
        return {"sentiment": "neutral", "confidence": 0.0, "reasoning": str(exc)[:100]}


async def analyze_topics(text: str) -> dict:
    client = GroqClient()
    if not client.available:
        return {"topics": [], "primary_topic": "unknown", "confidence": 0.0}
    try:
        raw = await client.analyze(prompt=text, system=TOPICS_SYSTEM)
        return _safe_parse(raw, {"topics": [], "primary_topic": "unknown", "confidence": 0.0})
    except Exception as exc:
        logger.error("analyze_topics error: %s", exc)
        return {"topics": [], "primary_topic": "unknown", "confidence": 0.0}


async def extract_pain_points(text: str) -> dict:
    client = GroqClient()
    if not client.available:
        return {"pain_points": [], "churn_risk": "low", "urgency_score": 0}
    try:
        raw = await client.analyze(prompt=text, system=PAIN_POINTS_SYSTEM)
        return _safe_parse(raw, {"pain_points": [], "churn_risk": "low", "urgency_score": 0})
    except Exception as exc:
        logger.error("extract_pain_points error: %s", exc)
        return {"pain_points": [], "churn_risk": "low", "urgency_score": 0}


async def analyze_transaction_behavior(transactions: list[dict]) -> dict:
    client = GroqClient()
    defaults = {
        "behavior_type": "casual",
        "engagement_trend": "stable",
        "key_signals": [],
        "next_action_recommendation": "N/A",
        "predicted_ltv_bucket": "medium",
    }
    if not client.available:
        return defaults
    try:
        prompt = f"Analyze this customer transaction history:\n{json.dumps(transactions[:50], default=str)}"
        raw = await client.analyze(prompt=prompt, system=TRANSACTION_SYSTEM)
        return _safe_parse(raw, defaults)
    except Exception as exc:
        logger.error("analyze_transaction_behavior error: %s", exc)
        return defaults
