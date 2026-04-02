from __future__ import annotations

from functools import lru_cache
from typing import Any


@lru_cache(maxsize=1)
def get_summarizer() -> Any:
    from transformers import pipeline as hf_pipeline

    return hf_pipeline("summarization", model="facebook/bart-large-cnn")


def summarize(
    text: str, max_length: int = 150, min_length: int = 40
) -> str:
    if len(text.split()) < min_length:
        return text
    pipe = get_summarizer()
    try:
        result = pipe(
            text[:1024],
            max_length=max_length,
            min_length=min_length,
            do_sample=False,
        )
        return str(result[0]["summary_text"])
    except Exception:
        return text[:500]
