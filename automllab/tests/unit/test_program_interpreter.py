"""Tests for ProgramInterpreter — mock Claude, verify parsing."""
import json
from unittest.mock import MagicMock, patch

import pytest

from models.research_plan import ResearchPlan


MOCK_PLAN_JSON = {
    "research_goal": "Improve nanochat training efficiency",
    "baseline": {
        "val_loss": 0.862,
        "training_time_minutes": 4.2,
        "model_description": "GPT-style transformer, 6 layers",
    },
    "constraints": {
        "max_gpu_memory_gb": 35,
        "max_experiment_minutes": 8,
        "max_total_hours": 8,
        "forbidden_files": ["data/", "evaluate.py"],
        "allowed_files": ["train.py", "model/transformer.py"],
    },
    "hypotheses": [
        {"id": "h1", "description": "Cosine annealing LR", "priority": 1},
        {"id": "h2", "description": "Warmup steps", "priority": 2},
    ],
    "success_criteria": [
        {"metric": "val_loss", "target": 0.80, "type": "primary"},
    ],
    "strategy": "bayesian_adaptive",
    "parallelism": 1,
    "checkpoint_frequency": "every_improvement",
}


def _make_mock_response(content: str) -> MagicMock:
    block = MagicMock()
    block.text = content
    resp = MagicMock()
    resp.content = [block]
    return resp


@patch("core.program_interpreter.anthropic.Anthropic")
def test_parse_returns_valid_research_plan(mock_anthropic_cls):
    mock_client = MagicMock()
    mock_client.messages.create.return_value = _make_mock_response(
        json.dumps(MOCK_PLAN_JSON)
    )
    mock_anthropic_cls.return_value = mock_client

    from core.program_interpreter import ProgramInterpreter

    interp = ProgramInterpreter("program.md")
    interp.client = mock_client

    from pathlib import Path
    from unittest.mock import mock_open

    with patch.object(Path, "read_text", return_value="# Mock program"):
        plan = interp.parse()

    assert isinstance(plan, ResearchPlan)
    assert plan.research_goal == "Improve nanochat training efficiency"
    assert plan.baseline.val_loss == 0.862
    assert plan.baseline.val_loss > 0
    assert plan.baseline.training_time_minutes > 0
    assert len(plan.hypotheses) >= 1
    assert plan.constraints.max_total_hours == 8
    assert plan.constraints.max_gpu_memory_gb == 35
    assert len(plan.constraints.forbidden_files) > 0
    assert plan.strategy == "bayesian_adaptive"


def test_research_plan_validation():
    """Verify Pydantic validation catches bad plans."""
    with pytest.raises(Exception):
        ResearchPlan(
            research_goal="",
            baseline={"val_loss": 0.5, "training_time_minutes": 1.0, "model_description": "x"},
            hypotheses=[],
            success_criteria=[{"metric": "val_loss", "target": 0.8, "type": "primary"}],
        )


def test_research_plan_direct_construction():
    """Directly construct a ResearchPlan from the mock data."""
    plan = ResearchPlan(**MOCK_PLAN_JSON)
    assert plan.research_goal == "Improve nanochat training efficiency"
    assert len(plan.hypotheses) == 2
    assert plan.success_criteria[0].target == 0.80
