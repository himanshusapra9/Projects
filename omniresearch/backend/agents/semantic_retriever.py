from __future__ import annotations

from typing import Any


def retrieve_relevant(
    query: str, documents: list[dict[str, Any]], top_k: int = 15
) -> list[dict[str, Any]]:
    if not documents:
        return []
    try:
        from ml.reranker import rerank

        return rerank(query, documents, top_k=top_k)
    except Exception:
        return documents[:top_k]
