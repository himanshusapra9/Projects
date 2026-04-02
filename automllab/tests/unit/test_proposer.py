"""Tests for ExperimentProposer — mock Claude, verify proposals."""
import json
import sys
from unittest.mock import MagicMock, patch

import pytest

from models.research_plan import ResearchPlan
from models.experiment import ExperimentProposal


MOCK_PLAN = ResearchPlan(
    research_goal="Improve nanochat",
    baseline={"val_loss": 0.862, "training_time_minutes": 4.2, "model_description": "GPT"},
    hypotheses=[{"id": "h1", "description": "Cosine LR", "priority": 1}],
    success_criteria=[{"metric": "val_loss", "target": 0.80, "type": "primary"}],
    constraints={"max_total_hours": 8, "max_experiment_minutes": 8,
                 "max_gpu_memory_gb": 35, "forbidden_files": [], "allowed_files": ["train.py"]},
)

MOCK_PROPOSALS = [
    {
        "hypothesis": "Cosine LR schedule",
        "description": "Replace constant LR with cosine annealing",
        "unified_diff": "--- a/train.py\n+++ b/train.py\n-lr=3e-4\n+scheduler=cosine",
        "rationale": "Cosine annealing has shown improvement",
        "confidence": 0.7,
        "estimated_val_loss": 0.82,
        "risks": ["May diverge with wrong warmup"],
    },
    {
        "hypothesis": "Higher weight decay",
        "description": "Increase weight decay to 0.1",
        "unified_diff": "--- a/train.py\n+++ b/train.py\n-wd=0.01\n+wd=0.1",
        "rationale": "Regularization on small dataset",
        "confidence": 0.5,
        "estimated_val_loss": 0.85,
        "risks": ["May underfit"],
    },
]


def _make_mock_response(content: str) -> MagicMock:
    block = MagicMock()
    block.text = content
    resp = MagicMock()
    resp.content = [block]
    return resp


def test_propose_returns_valid_proposals():
    """Mock Claude + SentenceTransformer to test proposal generation."""
    mock_st_module = MagicMock()
    mock_encoder_instance = MagicMock()
    mock_st_module.SentenceTransformer.return_value = mock_encoder_instance
    sys.modules["sentence_transformers"] = mock_st_module

    try:
        if "core.experiment_proposer" in sys.modules:
            del sys.modules["core.experiment_proposer"]

        with patch("anthropic.Anthropic") as mock_anthropic_cls:
            mock_client = MagicMock()
            mock_client.messages.create.return_value = _make_mock_response(
                json.dumps(MOCK_PROPOSALS)
            )
            mock_anthropic_cls.return_value = mock_client

            from core.experiment_proposer import ExperimentProposer

            proposer = ExperimentProposer(MOCK_PLAN)
            proposer.client = mock_client

            proposals = proposer.propose_next_batch(n=2)

            assert len(proposals) >= 1
            for p in proposals:
                assert isinstance(p, ExperimentProposal)
                assert p.hypothesis
                assert p.unified_diff
                assert 0.0 <= p.confidence <= 1.0
    finally:
        if "sentence_transformers" in sys.modules:
            del sys.modules["sentence_transformers"]
        if "core.experiment_proposer" in sys.modules:
            del sys.modules["core.experiment_proposer"]


def test_experiment_proposal_validation():
    """Verify Pydantic validation on ExperimentProposal."""
    p = ExperimentProposal(
        hypothesis="Test",
        description="Test desc",
        unified_diff="--- a\n+++ b",
        confidence=0.5,
    )
    assert p.hypothesis == "Test"
    assert p.confidence == 0.5

    with pytest.raises(Exception):
        ExperimentProposal(hypothesis="", description="", unified_diff="")
