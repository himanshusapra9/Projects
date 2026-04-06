from __future__ import annotations

from datetime import datetime
from typing import Optional

import anthropic
import pandas as pd

from models.experiment import ExperimentResult
from models.report import Report
from models.research_plan import ResearchPlan


class ReportGenerator:
    def __init__(self, plan: ResearchPlan):
        self.plan = plan
        self._client: Optional[anthropic.Anthropic] = None

    @property
    def client(self) -> anthropic.Anthropic:
        if self._client is None:
            self._client = anthropic.Anthropic()
        return self._client

    def generate(self, results: list[ExperimentResult]) -> Report:
        kept = [r for r in results if r.decision == "kept"]
        best = min(kept, key=lambda r: r.metrics.val_loss) if kept else None

        narrative = self._generate_narrative(results, best)

        log_df = pd.DataFrame(
            [
                {
                    "exp_id": r.exp_id,
                    "hypothesis": getattr(r.proposal, "hypothesis", "") if r.proposal else "",
                    "description": getattr(r.proposal, "description", "") if r.proposal else "",
                    "val_loss": r.metrics.val_loss if r.metrics else float("inf"),
                    "val_loss_delta": (
                        r.metrics.val_loss - self.plan.baseline.val_loss
                        if r.metrics
                        else float("inf")
                    ),
                    "duration_seconds": r.duration_seconds,
                    "decision": r.decision,
                    "commit_hash": r.commit_hash or "",
                    "safety_flags": "; ".join(r.safety_flags or []),
                    "timestamp": r.timestamp or datetime.utcnow().isoformat(),
                }
                for r in results
            ]
        )

        return Report(
            narrative=narrative,
            experiment_log=log_df,
            best_result=best,
            total_experiments=len(results),
            kept_experiments=len(kept),
            improvement_pct=self._improvement_pct(best),
        )

    def generate_without_llm(self, results: list[ExperimentResult]) -> Report:
        """Generate a report without calling Claude (for testing)."""
        kept = [r for r in results if r.decision == "kept"]
        best = (
            min(kept, key=lambda r: r.metrics.val_loss)
            if kept and all(r.metrics for r in kept)
            else None
        )

        log_df = pd.DataFrame(
            [
                {
                    "exp_id": r.exp_id,
                    "hypothesis": getattr(r.proposal, "hypothesis", "") if r.proposal else "",
                    "description": getattr(r.proposal, "description", "") if r.proposal else "",
                    "val_loss": r.metrics.val_loss if r.metrics else float("inf"),
                    "duration_seconds": r.duration_seconds,
                    "decision": r.decision,
                }
                for r in results
            ]
        )

        narrative = f"AutoMLab ran {len(results)} experiments. {len(kept)} kept."
        if best and best.metrics:
            narrative += f" Best val_loss: {best.metrics.val_loss:.4f}"

        return Report(
            narrative=narrative,
            experiment_log=log_df,
            best_result=best,
            total_experiments=len(results),
            kept_experiments=len(kept),
            improvement_pct=self._improvement_pct(best),
        )

    def _generate_narrative(self, results: list[ExperimentResult], best: Optional[ExperimentResult]) -> str:
        kept = [r for r in results if r.decision == "kept"]
        top_5 = sorted(
            [r for r in results if r.metrics],
            key=lambda r: r.metrics.val_loss,
        )[:5]
        summary_rows = "\n".join(
            [
                f"- {r.exp_id}: {r.decision} | val_loss={r.metrics.val_loss:.4f} "
                f"| {getattr(r.proposal, 'description', '') if r.proposal else ''}"
                for r in top_5
            ]
        )
        best_str = f"{best.metrics.val_loss:.4f}" if best and best.metrics else "no improvement"
        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": f"""AutoMLab ran {len(results)} experiments overnight.
Goal: {self.plan.research_goal}
Baseline val_loss: {self.plan.baseline.val_loss}
Best val_loss: {best_str}
Kept experiments: {len(kept)}/{len(results)}

Top experiments:
{summary_rows}

Write a concise research narrative covering:
1. Overall progress
2. Most important discoveries
3. Surprising failures
4. Emerging hypotheses for next session
5. Specific changes for tomorrow""",
                }
            ],
        )
        return response.content[0].text

    def _improvement_pct(self, best: Optional[ExperimentResult]) -> float:
        if not best or not best.metrics:
            return 0.0
        delta = self.plan.baseline.val_loss - best.metrics.val_loss
        return round(delta / self.plan.baseline.val_loss * 100, 2)
