from __future__ import annotations

from functools import lru_cache
from typing import Any

import numpy as np
from numpy.typing import NDArray


@lru_cache(maxsize=1)
def get_encoder() -> Any:
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer("BAAI/bge-large-en-v1.5")


def encode(
    texts: list[str], batch_size: int = 32
) -> NDArray[np.floating[Any]]:
    model = get_encoder()
    return model.encode(
        texts,
        batch_size=batch_size,
        normalize_embeddings=True,
        show_progress_bar=False,
    )


def deduplicate(
    documents: list[dict[str, Any]], threshold: float = 0.95
) -> list[dict[str, Any]]:
    if not documents:
        return []
    texts = [
        str(d.get("text", d.get("abstract", d.get("transcript", ""))))[:512]
        for d in documents
    ]
    embeddings = encode(texts)
    kept: list[dict[str, Any]] = []
    seen_indices: set[int] = set()
    for i, emb in enumerate(embeddings):
        if i in seen_indices:
            continue
        kept.append(documents[i])
        for j in range(i + 1, len(embeddings)):
            if j not in seen_indices:
                sim = float(np.dot(emb, embeddings[j]))
                if sim > threshold:
                    seen_indices.add(j)
    return kept
