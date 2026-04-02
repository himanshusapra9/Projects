from __future__ import annotations

import json
import re
from typing import Optional

import anthropic
import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern
from sentence_transformers import SentenceTransformer
from functools import lru_cache

from models.research_plan import ResearchPlan
from models.experiment import ExperimentProposal, ExperimentResult


@lru_cache(maxsize=1)
def _get_encoder() -> SentenceTransformer:
    return SentenceTransformer("BAAI/bge-large-en-v1.5")


class ExperimentProposer:
    def __init__(self, plan: ResearchPlan):
        self.plan = plan
        self.client = anthropic.Anthropic()
        self.history: list[ExperimentResult] = []
        self.encoder = _get_encoder()
        self.gp = GaussianProcessRegressor(
            kernel=Matern(nu=2.5), n_restarts_optimizer=5, normalize_y=True
        )

    def add_result(self, result: ExperimentResult) -> None:
        self.history.append(result)
        if len(self.history) >= 10:
            self._fit_gp()

    def propose_next_batch(self, n: int = 3) -> list[ExperimentProposal]:
        history_text = self._format_history()
        gp_context = self._get_gp_context()

        prompt = f"""RESEARCH GOAL: {self.plan.research_goal}

BASELINE: val_loss = {self.plan.baseline.val_loss}
CURRENT BEST: val_loss = {self._best_val_loss()}

EXPERIMENT HISTORY ({len(self.history)} experiments):
{history_text}

BAYESIAN OPTIMIZATION CONTEXT:
{gp_context}

Propose {n} NEW experiments. For each return JSON:
[{{"hypothesis": "str", "description": "str", "unified_diff": "str",
   "rationale": "str", "confidence": 0.0-1.0, "estimated_val_loss": float,
   "risks": ["str"]}}]

RULES:
- Each proposal DIFFERENT from all previous experiments
- Keep changes focused (1-3 hyperparameter changes max)
- Return ONLY a JSON array"""

        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text
        json_match = re.search(r"\[.*\]", raw, re.DOTALL)
        if json_match:
            raw = json_match.group(0)
        proposals = [ExperimentProposal(**p) for p in json.loads(raw)]
        return self._filter_duplicates(proposals)

    def _filter_duplicates(self, proposals: list[ExperimentProposal]) -> list[ExperimentProposal]:
        if not self.history:
            return proposals
        hist_descs = [r.proposal.description for r in self.history if r.proposal]
        if not hist_descs:
            return proposals
        hist_embs = self.encoder.encode(hist_descs, normalize_embeddings=True)
        filtered = []
        for prop in proposals:
            prop_emb = self.encoder.encode([prop.description], normalize_embeddings=True)[0]
            max_sim = max(float(np.dot(prop_emb, h)) for h in hist_embs)
            if max_sim < 0.90:
                filtered.append(prop)
        return filtered or proposals[:1]

    def _best_val_loss(self) -> float:
        if not self.history:
            return self.plan.baseline.val_loss
        kept = [r for r in self.history if r.decision == "kept" and r.metrics]
        if not kept:
            return self.plan.baseline.val_loss
        return min(r.metrics.val_loss for r in kept)

    def _fit_gp(self) -> None:
        valid = [r for r in self.history if r.metrics and r.metrics.val_loss < float("inf")]
        if len(valid) < 3:
            return
        X = np.array([[i] for i in range(len(valid))])
        y = np.array([r.metrics.val_loss for r in valid])
        self.gp.fit(X, y)

    def _get_gp_context(self) -> str:
        valid = [r for r in self.history if r.metrics and r.metrics.val_loss < float("inf")]
        if len(valid) < 10:
            return f"Not enough data for GP (need 10, have {len(valid)})"
        X_next = np.array([[len(valid) + i] for i in range(5)])
        y_pred, y_std = self.gp.predict(X_next, return_std=True)
        return (
            f"GP predicts next experiments: mean val_loss = {y_pred.mean():.4f}, "
            f"uncertainty = {y_std.mean():.4f}. "
            f"High uncertainty suggests exploration is valuable."
        )

    def _format_history(self) -> str:
        if not self.history:
            return "No experiments run yet."
        lines = []
        for r in self.history[-20:]:
            desc = r.proposal.description if r.proposal else "N/A"
            val = r.metrics.val_loss if r.metrics else float("inf")
            lines.append(f"- {r.exp_id}: {r.decision} | val_loss={val:.4f} | {desc}")
        return "\n".join(lines)
