from __future__ import annotations

from functools import lru_cache
from typing import Any


@lru_cache(maxsize=1)
def get_topic_embedding_model() -> Any:
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer("all-MiniLM-L6-v2")


def cluster_topics(
    texts: list[str], min_cluster_size: int = 3
) -> list[dict[str, Any]]:
    if len(texts) < min_cluster_size:
        return [
            {
                "topic_id": 0,
                "label": "general",
                "documents": list(range(len(texts))),
            }
        ]
    try:
        from bertopic import BERTopic

        model = BERTopic(
            min_topic_size=min_cluster_size,
            verbose=False,
            embedding_model=get_topic_embedding_model(),
        )
        topics, _probs = model.fit_transform(texts)
        topic_info = model.get_topic_info()
        result: list[dict[str, Any]] = []
        for _, row in topic_info.iterrows():
            tid = int(row["Topic"])
            if tid == -1:
                continue
            doc_indices = [i for i, t in enumerate(topics) if t == tid]
            result.append(
                {
                    "topic_id": tid,
                    "label": str(row.get("Name", f"topic_{tid}")),
                    "count": int(row.get("Count", len(doc_indices))),
                    "documents": doc_indices,
                }
            )
        return result
    except Exception:
        return [
            {
                "topic_id": 0,
                "label": "general",
                "documents": list(range(len(texts))),
            }
        ]
