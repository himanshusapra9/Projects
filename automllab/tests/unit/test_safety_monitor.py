"""Tests for SafetyMonitor — verify all forbidden patterns detected."""
import pytest

from core.safety_monitor import SafetyMonitor, FORBIDDEN_PATTERNS
from models.research_plan import ResearchPlan


PLAN = ResearchPlan(
    research_goal="Test",
    baseline={"val_loss": 0.862, "training_time_minutes": 4.2, "model_description": "GPT"},
    hypotheses=[{"id": "h1", "description": "Test hyp", "priority": 1}],
    success_criteria=[{"metric": "val_loss", "target": 0.80, "type": "primary"}],
    constraints={
        "max_total_hours": 1,
        "max_experiment_minutes": 8,
        "max_gpu_memory_gb": 35,
        "forbidden_files": ["data/tokenizer.py", "evaluate.py"],
        "allowed_files": ["train.py"],
    },
)


@pytest.fixture
def monitor() -> SafetyMonitor:
    return SafetyMonitor(PLAN)


# --- FORBIDDEN PATTERN TESTS ---

MALICIOUS_DIFFS = [
    ('os.system("rm -rf /")', "os.system"),
    ('subprocess.call("ls", shell=True)', "subprocess"),
    ('eval("malicious_code")', "eval"),
    ('exec("import os")', "exec"),
    ('__import__("os").system("pwd")', "__import__"),
    ("open('/etc/passwd')", "system file"),
    ("rm -rf /home/user", "rm -rf"),
    ("DROP TABLE users;", "DROP TABLE"),
    ("shutil.rmtree('/usr')", "shutil.rmtree"),
]


@pytest.mark.parametrize("diff,label", MALICIOUS_DIFFS)
def test_forbidden_patterns_are_detected(monitor: SafetyMonitor, diff: str, label: str):
    is_safe, violations = monitor.validate_diff(diff)
    assert not is_safe, f"Expected diff with '{label}' to be flagged"
    assert len(violations) > 0


def test_clean_diff_passes(monitor: SafetyMonitor):
    clean_diff = """
--- a/train.py
+++ b/train.py
@@ -10,7 +10,7 @@
 def train():
-    lr = 3e-4
+    lr = 1e-3
     optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
"""
    is_safe, violations = monitor.validate_diff(clean_diff)
    assert is_safe
    assert len(violations) == 0


# --- FILE VALIDATION TESTS ---

def test_forbidden_file_detected(monitor: SafetyMonitor):
    is_safe, violations = monitor.validate_touched_files(["data/tokenizer.py"])
    assert not is_safe
    assert any("Forbidden" in v for v in violations)


def test_allowed_file_passes(monitor: SafetyMonitor):
    is_safe, violations = monitor.validate_touched_files(["train.py"])
    assert is_safe
    assert len(violations) == 0


# --- GPU MEMORY ESTIMATE ---

def test_gpu_memory_estimate_with_d_model(monitor: SafetyMonitor):
    assert monitor.estimate_gpu_memory("d_model = 1024") == 2048


def test_gpu_memory_estimate_default(monitor: SafetyMonitor):
    assert monitor.estimate_gpu_memory("lr = 1e-3") == 512
