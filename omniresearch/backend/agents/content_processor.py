from __future__ import annotations

from typing import Any

from ml.credibility import score_credibility


def process_documents(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not documents:
        return []
    for doc in documents:
        doc["credibility_score"] = score_credibility(doc)
    try:
        from ml.embeddings import deduplicate

        documents = deduplicate(documents, threshold=0.95)
    except Exception:
        pass
    return documents
