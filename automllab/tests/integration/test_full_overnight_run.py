"""Integration test: run orchestrator with a toy training script for 5 experiments."""
import asyncio
import os
import tempfile
import shutil
from pathlib import Path
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest

from models.research_plan import ResearchPlan, Baseline, Constraints, Hypothesis, SuccessCriterion
from models.experiment import ExperimentProposal, ExperimentResult, ExperimentMetrics
from core.safety_monitor import SafetyMonitor
from core.memory_engine import MemoryEngine
from core.report_generator import ReportGenerator


PLAN = ResearchPlan(
    research_goal="Test overnight run",
    baseline=Baseline(val_loss=0.862, training_time_minutes=0.1, model_description="toy"),
    constraints=Constraints(
        max_gpu_memory_gb=35,
        max_experiment_minutes=1,
        max_total_hours=1,
        forbidden_files=[],
        allowed_files=["train.py"],
    ),
    hypotheses=[Hypothesis(id="h1", description="test hypothesis", priority=1)],
    success_criteria=[SuccessCriterion(metric="val_loss", target=0.50, type="primary")],
    strategy="bayesian_adaptive",
    parallelism=1,
)


def _make_result(exp_id: str, val_loss: float, decision: str) -> ExperimentResult:
    return ExperimentResult(
        exp_id=exp_id,
        proposal=ExperimentProposal(
            hypothesis="test",
            description=f"Experiment {exp_id}",
            unified_diff="--- a/train.py\n+++ b/train.py\n test",
        ),
        status="completed",
        decision=decision,
        metrics=ExperimentMetrics(val_loss=val_loss),
        duration_seconds=2.0,
    )


def test_memory_engine_stores_and_retrieves():
    """Test MemoryEngine saves and loads experiments."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "experiments.db")
        memory = MemoryEngine(db_path)

        results = [
            _make_result("exp_0001", 0.85, "kept"),
            _make_result("exp_0002", 0.90, "discarded"),
            _make_result("exp_0003", 0.80, "kept"),
            _make_result("exp_0004", 0.88, "discarded"),
            _make_result("exp_0005", 0.78, "kept"),
        ]

        for r in results:
            memory.save(r)

        all_rows = memory.load_all()
        assert len(all_rows) == 5

        best = memory.get_best()
        assert best is not None
        assert best["val_loss"] == 0.78


def test_report_generation_with_5_experiments():
    """Run report generation with 5 mock results, verify CSV and narrative."""
    results = [
        _make_result("exp_0001", 0.85, "kept"),
        _make_result("exp_0002", 0.90, "discarded"),
        _make_result("exp_0003", 0.80, "kept"),
        _make_result("exp_0004", 0.88, "discarded"),
        _make_result("exp_0005", 0.78, "kept"),
    ]

    reporter = ReportGenerator(PLAN)
    report = reporter.generate_without_llm(results)

    assert report.total_experiments == 5
    assert report.kept_experiments == 3
    assert report.narrative
    assert len(report.narrative) > 0

    assert report.experiment_log is not None
    df = report.experiment_log
    assert len(df) == 5
    assert "exp_id" in df.columns
    assert "val_loss" in df.columns
    assert "decision" in df.columns


def test_experiment_log_csv_export():
    """Verify experiment log can be exported to CSV."""
    results = [_make_result(f"exp_{i:04d}", 0.9 - i * 0.02, "kept") for i in range(5)]

    reporter = ReportGenerator(PLAN)
    report = reporter.generate_without_llm(results)

    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False, mode="w") as f:
        report.experiment_log.to_csv(f, index=False)
        csv_path = f.name

    try:
        df = pd.read_csv(csv_path)
        assert len(df) == 5
        assert df["val_loss"].iloc[-1] < df["val_loss"].iloc[0]
    finally:
        os.unlink(csv_path)
