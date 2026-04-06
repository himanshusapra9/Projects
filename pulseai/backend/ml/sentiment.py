from __future__ import annotations


def _get_sentiment_pipeline():
    """Lazy import to avoid requiring transformers at module load time."""
    from transformers import pipeline as hf_pipeline

    return hf_pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        tokenizer="cardiffnlp/twitter-roberta-base-sentiment-latest",
        max_length=512,
        truncation=True,
    )


_pipeline_instance = None


def _get_or_create_pipeline():
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = _get_sentiment_pipeline()
    return _pipeline_instance


def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment of a text string. Returns label, score, polarity."""
    pipe = _get_or_create_pipeline()
    result = pipe(text[:512])[0]
    label_map = {"positive": 1.0, "neutral": 0.0, "negative": -1.0}
    return {
        "label": result["label"],
        "score": result["score"],
        "polarity": label_map.get(result["label"], 0.0),
    }


def analyze_sentiment_mock(text: str) -> dict:
    """Mock sentiment analysis for testing without ML models."""
    text_lower = text.lower()
    positive_words = [
        "amazing",
        "great",
        "love",
        "excellent",
        "awesome",
        "fantastic",
        "wonderful",
    ]
    negative_words = [
        "broken",
        "terrible",
        "hate",
        "awful",
        "cancel",
        "worst",
        "horrible",
        "bug",
    ]

    pos_count = sum(1 for w in positive_words if w in text_lower)
    neg_count = sum(1 for w in negative_words if w in text_lower)

    if pos_count > neg_count:
        return {"label": "positive", "score": 0.85, "polarity": 1.0}
    elif neg_count > pos_count:
        return {"label": "negative", "score": 0.85, "polarity": -1.0}
    else:
        return {"label": "neutral", "score": 0.7, "polarity": 0.0}
