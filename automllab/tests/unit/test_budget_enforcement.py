"""Tests for budget enforcement in SafetyMonitor."""
import pytest

from core.safety_monitor import SafetyMonitor
from models.research_plan import ResearchPlan


def _make_plan(max_total_hours: int) -> ResearchPlan:
    return ResearchPlan(
        research_goal="Test",
        baseline={"val_loss": 0.862, "training_time_minutes": 4.2, "model_description": "GPT"},
        hypotheses=[{"id": "h1", "description": "Test", "priority": 1}],
        success_criteria=[{"metric": "val_loss", "target": 0.80, "type": "primary"}],
        constraints={
            "max_total_hours": max_total_hours,
            "max_experiment_minutes": 8,
            "max_gpu_memory_gb": 35,
            "forbidden_files": [],
            "allowed_files": [],
        },
    )


def test_budget_expired_returns_false():
    plan = _make_plan(max_total_hours=1)
    monitor = SafetyMonitor(plan)
    assert monitor.check_budget_remaining(3601) is False


def test_budget_within_limit_returns_true():
    plan = _make_plan(max_total_hours=1)
    monitor = SafetyMonitor(plan)
    assert monitor.check_budget_remaining(1000) is True


def test_budget_at_95_percent_returns_false():
    """Budget check uses 95% threshold: 1 hour = 3600s, 95% = 3420s."""
    plan = _make_plan(max_total_hours=1)
    monitor = SafetyMonitor(plan)
    assert monitor.check_budget_remaining(3420) is False


def test_budget_just_under_95_percent():
    plan = _make_plan(max_total_hours=1)
    monitor = SafetyMonitor(plan)
    assert monitor.check_budget_remaining(3419) is True


def test_budget_8_hours():
    plan = _make_plan(max_total_hours=8)
    monitor = SafetyMonitor(plan)
    max_seconds = 8 * 3600
    assert monitor.check_budget_remaining(max_seconds * 0.94) is True
    assert monitor.check_budget_remaining(max_seconds * 0.96) is False
