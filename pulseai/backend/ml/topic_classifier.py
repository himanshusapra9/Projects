from __future__ import annotations

_classifier_instance = None


def _get_classifier():
    global _classifier_instance
    if _classifier_instance is None:
        from transformers import pipeline as hf_pipeline

        _classifier_instance = hf_pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli",
        )
    return _classifier_instance


def classify_topics(
    text: str, candidate_labels: list[str], threshold: float = 0.3
) -> list[str]:
    classifier = _get_classifier()
    result = classifier(text[:512], candidate_labels, multi_label=True)
    return [
        label
        for label, score in zip(result["labels"], result["scores"])
        if score >= threshold
    ]


def classify_topics_mock(
    text: str, candidate_labels: list[str], threshold: float = 0.3
) -> list[str]:
    """Mock topic classification for testing."""
    text_lower = text.lower()
    matched = []
    keyword_map = {
        "onboarding": ["onboarding", "setup", "getting started", "sign up"],
        "billing": ["billing", "payment", "invoice", "charge", "subscription"],
        "performance": ["slow", "fast", "speed", "performance", "loading"],
        "integrations": ["integration", "connect", "api", "webhook"],
        "mobile": ["mobile", "app", "ios", "android", "phone"],
        "search": ["search", "find", "filter", "query"],
        "notifications": ["notification", "alert", "email", "push"],
        "security": ["security", "password", "auth", "login", "2fa"],
        "pricing": ["price", "pricing", "cost", "expensive", "plan"],
        "ui_ux": ["ui", "ux", "design", "layout", "button", "interface"],
        "support": ["support", "help", "ticket", "customer service"],
    }
    for label in candidate_labels:
        keywords = keyword_map.get(label, [label])
        if any(kw in text_lower for kw in keywords):
            matched.append(label)
    return matched or candidate_labels[:1]
