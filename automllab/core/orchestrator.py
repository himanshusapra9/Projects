from __future__ import annotations

import asyncio
import time
from pathlib import Path

from core.experiment_proposer import ExperimentProposer
from core.memory_engine import MemoryEngine
from core.program_interpreter import ProgramInterpreter
from core.report_generator import ReportGenerator
from core.safety_monitor import SafetyMonitor
from core.sandbox_executor import SandboxExecutor
from models.experiment import ExperimentResult


class Orchestrator:
    def __init__(self, base_dir: str, program_path: str = "program.md"):
        self.base_dir = base_dir
        self.plan = ProgramInterpreter(program_path).parse()
        self.monitor = SafetyMonitor(self.plan)
        self.proposer = ExperimentProposer(self.plan)
        self.executor = SandboxExecutor(base_dir, self.plan, self.monitor)
        self.memory = MemoryEngine(f"{base_dir}/.automllab/experiments.db")
        self.reporter = ReportGenerator(self.plan)
        self.results: list[ExperimentResult] = []
        self.exp_counter = 0

    async def run(self) -> None:
        print(f"AutoMLab starting. Goal: {self.plan.research_goal}")
        print(f"Baseline val_loss: {self.plan.baseline.val_loss}")
        print(f"Budget: {self.plan.constraints.max_total_hours}h")

        start_time = time.time()
        parallelism = self.plan.parallelism

        while self.monitor.check_budget_remaining(time.time() - start_time):
            best = self._best_val_loss()
            primary = [c for c in self.plan.success_criteria if c.type == "primary"]
            if primary and best <= primary[0].target:
                print(
                    f"SUCCESS! val_loss {best:.4f} <= target {primary[0].target}"
                )
                break

            try:
                proposals = self.proposer.propose_next_batch(n=parallelism)
            except Exception as e:
                print(f"Proposer error: {e}. Retrying in 60s.")
                await asyncio.sleep(60)
                continue

            tasks = []
            for proposal in proposals:
                exp_id = f"exp_{self.exp_counter:04d}"
                self.exp_counter += 1
                tasks.append(self.executor.run_experiment(proposal, exp_id))

            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in batch_results:
                if isinstance(result, Exception):
                    print(f"Experiment error: {result}")
                    continue
                self.results.append(result)
                self.proposer.add_result(result)
                self.memory.save(result)
                metrics_str = (
                    f"val_loss={result.metrics.val_loss:.4f}"
                    if result.metrics
                    else "no metrics"
                )
                print(
                    f"[{result.exp_id}] {result.decision.upper()} — "
                    f"{metrics_str} ({result.duration_seconds:.0f}s)"
                )

        report = self.reporter.generate(self.results)
        report_path = Path(self.base_dir) / ".automllab" / "report.md"
        report_path.parent.mkdir(exist_ok=True)
        report_path.write_text(report.narrative)
        if report.experiment_log is not None:
            report.experiment_log.to_csv(
                Path(self.base_dir) / ".automllab" / "experiment_log.csv",
                index=False,
            )
        print(
            f"\nDone. {len(self.results)} experiments. "
            f"Best val_loss: {self._best_val_loss():.4f}"
        )
        print(f"Report: {report_path}")

    def _best_val_loss(self) -> float:
        kept = [r for r in self.results if r.decision == "kept" and r.metrics]
        if not kept:
            return self.plan.baseline.val_loss
        return min(r.metrics.val_loss for r in kept)


if __name__ == "__main__":
    import sys

    base = sys.argv[1] if len(sys.argv) > 1 else "."
    asyncio.run(Orchestrator(base).run())
