from dataclasses import dataclass
from typing import Optional

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


@dataclass
class DuplicateCandidate:
    product_id: str
    matched_product_id: str
    similarity_score: float
    match_signals: dict


class EntityResolver:
    DUPLICATE_THRESHOLD = 0.92
    NEAR_DUPLICATE_THRESHOLD = 0.80

    async def find_duplicates(
        self,
        product_id: str,
        product_embedding: Optional[list[float]],
        product_identity: dict,
        candidate_embeddings: list[tuple[str, list[float], dict]],
    ) -> list[DuplicateCandidate]:
        if not product_embedding or not candidate_embeddings:
            return []

        target_vec = np.array(product_embedding).reshape(1, -1)
        results = []

        for cand_id, cand_embedding, cand_identity in candidate_embeddings:
            if cand_id == product_id:
                continue

            cand_vec = np.array(cand_embedding).reshape(1, -1)
            embedding_sim = float(cosine_similarity(target_vec, cand_vec)[0][0])

            identity_sim = self._compute_identity_similarity(product_identity, cand_identity)
            combined_score = 0.6 * embedding_sim + 0.4 * identity_sim

            if combined_score >= self.NEAR_DUPLICATE_THRESHOLD:
                results.append(
                    DuplicateCandidate(
                        product_id=product_id,
                        matched_product_id=cand_id,
                        similarity_score=round(combined_score, 4),
                        match_signals={
                            "embedding_similarity": round(embedding_sim, 4),
                            "identity_similarity": round(identity_sim, 4),
                            "is_exact_duplicate": combined_score >= self.DUPLICATE_THRESHOLD,
                        },
                    )
                )

        results.sort(key=lambda x: x.similarity_score, reverse=True)
        return results

    def _compute_identity_similarity(self, identity_a: dict, identity_b: dict) -> float:
        score = 0.0
        checks = 0

        if identity_a.get("gtin") and identity_b.get("gtin"):
            checks += 1
            if identity_a["gtin"] == identity_b["gtin"]:
                return 1.0

        if identity_a.get("brand") and identity_b.get("brand"):
            checks += 1
            if identity_a["brand"].lower() == identity_b["brand"].lower():
                score += 1.0

        if identity_a.get("model_number") and identity_b.get("model_number"):
            checks += 1
            if identity_a["model_number"].lower() == identity_b["model_number"].lower():
                score += 1.0

        if identity_a.get("title") and identity_b.get("title"):
            checks += 1
            title_a_words = set(identity_a["title"].lower().split())
            title_b_words = set(identity_b["title"].lower().split())
            if title_a_words and title_b_words:
                overlap = len(title_a_words & title_b_words) / max(len(title_a_words), len(title_b_words))
                score += overlap

        return score / checks if checks > 0 else 0.0
