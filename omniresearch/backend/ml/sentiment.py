from __future__ import annotations

from functools import lru_cache
from typing import Any


@lru_cache(maxsize=1)
def get_sentiment_pipeline() -> Any:
    from transformers import pipeline as hf_pipeline

    return hf_pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        tokenizer="cardiffnlp/twitter-roberta-base-sentiment-latest",
        max_length=512,
        truncation=True,
    )


def analyze_sentiment(text: str) -> dict[str, Any]:
    pipe = get_sentiment_pipeline()
    result = pipe(text[:512])[0]
    label_map = {"positive": 1.0, "neutral": 0.0, "negative": -1.0}
    label = str(result["label"]).lower()
    return {
        "label": result["label"],
        "score": float(result["score"]),
        "polarity": float(label_map.get(label, 0.0)),
    }
