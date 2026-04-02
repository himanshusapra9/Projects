from __future__ import annotations

from functools import lru_cache
from typing import Any


@lru_cache(maxsize=1)
def get_ner_pipeline() -> Any:
    from transformers import pipeline as hf_pipeline

    return hf_pipeline(
        "ner",
        model="dslim/bert-base-NER",
        aggregation_strategy="simple",
    )


def extract_entities(text: str) -> list[dict[str, Any]]:
    pipe = get_ner_pipeline()
    try:
        results = pipe(text[:512])
        return [
            {
                "entity": r["entity_group"],
                "word": r["word"],
                "score": round(float(r["score"]), 3),
            }
            for r in results
            if float(r["score"]) > 0.5
        ]
    except Exception:
        return []
