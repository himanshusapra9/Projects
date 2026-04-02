from __future__ import annotations

import asyncio
import os
import re
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Optional

import git

from core.safety_monitor import SafetyMonitor
from models.experiment import ExperimentMetrics, ExperimentProposal, ExperimentResult
from models.research_plan import ResearchPlan


class SandboxExecutor:
    def __init__(self, base_dir: str, plan: ResearchPlan, monitor: SafetyMonitor):
        self.base_dir = Path(base_dir)
        self.plan = plan
        self.monitor = monitor
        self.repo = git.Repo(base_dir)

    async def run_experiment(
        self, proposal: ExperimentProposal, exp_id: str
    ) -> ExperimentResult:
        branch_name = f"experiment/{exp_id}"

        safe, violations = self.monitor.validate_diff(proposal.unified_diff)
        if not safe:
            return ExperimentResult(
                exp_id=exp_id,
                status="rejected",
                decision="discarded",
                safety_flags=violations,
            )

        self.repo.create_head(branch_name, self.repo.heads["main"])
        self.repo.heads[branch_name].checkout()

        try:
            self._apply_patch(proposal.unified_diff)

            changed = [item.a_path for item in self.repo.index.diff(None)]
            file_safe, file_violations = self.monitor.validate_touched_files(changed)
            if not file_safe:
                self.repo.git.checkout("--", ".")
                self.repo.heads["main"].checkout()
                return ExperimentResult(
                    exp_id=exp_id,
                    status="rejected",
                    decision="discarded",
                    safety_flags=file_violations,
                )

            start = time.time()
            max_seconds = self.plan.constraints.max_experiment_minutes * 60

            try:
                metrics = await asyncio.wait_for(
                    self._run_training(exp_id), timeout=max_seconds
                )
                duration = time.time() - start
                result = ExperimentResult(
                    exp_id=exp_id,
                    proposal=proposal,
                    status="completed",
                    metrics=metrics,
                    duration_seconds=duration,
                )
            except asyncio.TimeoutError:
                return ExperimentResult(
                    exp_id=exp_id,
                    proposal=proposal,
                    status="timeout",
                    decision="discarded",
                    duration_seconds=float(max_seconds),
                )

            if metrics.val_loss < self.plan.baseline.val_loss:
                self.repo.index.add(changed)
                self.repo.index.commit(
                    f"experiment/{exp_id}: val_loss={metrics.val_loss:.4f} "
                    f"(baseline={self.plan.baseline.val_loss:.4f}, "
                    f"delta={metrics.val_loss - self.plan.baseline.val_loss:+.4f})\n\n"
                    f"Hypothesis: {proposal.hypothesis}\n"
                    f"Description: {proposal.description}"
                )
                result.decision = "kept"
                result.commit_hash = self.repo.head.commit.hexsha
            else:
                self.repo.git.checkout("--", ".")
                result.decision = "discarded"

            return result

        finally:
            self.repo.heads["main"].checkout()
            try:
                self.repo.delete_head(branch_name, force=True)
            except Exception:
                pass

    async def _run_training(self, exp_id: str) -> ExperimentMetrics:
        proc = await asyncio.create_subprocess_exec(
            "python",
            "training/nanochat/train.py",
            f"--exp-id={exp_id}",
            cwd=str(self.base_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        log_lines: list[str] = []
        assert proc.stdout is not None
        async for line in proc.stdout:
            decoded = line.decode().strip()
            log_lines.append(decoded)

        await proc.wait()
        return self._parse_metrics(log_lines)

    def _parse_metrics(self, log_lines: list[str]) -> ExperimentMetrics:
        val_loss = float("inf")
        for line in reversed(log_lines):
            if "val_loss" in line.lower():
                m = re.search(r"val_loss[:\s=]+([0-9.]+)", line, re.IGNORECASE)
                if m:
                    val_loss = float(m.group(1))
                    break
        return ExperimentMetrics(val_loss=val_loss)

    def _apply_patch(self, unified_diff: str) -> None:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".patch", delete=False
        ) as f:
            f.write(unified_diff)
            patch_path = f.name
        try:
            result = subprocess.run(
                ["git", "apply", "--whitespace=fix", patch_path],
                cwd=str(self.base_dir),
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                raise ValueError(f"Patch failed: {result.stderr}")
        finally:
            os.unlink(patch_path)
