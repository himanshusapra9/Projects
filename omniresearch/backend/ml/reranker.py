from __future__ import annotations

from functools import lru_cache
from typing import Any


@lru_cache(maxsize=1)
def get_reranker() -> Any:
    from sentence_transformers import CrossEncoder

    return CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")


def rerank(
    query: str, documents: list[dict[str, Any]], top_k: int = 15
) -> list[dict[str, Any]]:
    if not documents:
        return []
    reranker = get_reranker()
    texts = [
        str(d.get("text", d.get("abstract", d.get("transcript", ""))))[:512]
        for d in documents
    ]
    pairs = [[query, t] for t in texts]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(documents, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in ranked[:top_k]]
