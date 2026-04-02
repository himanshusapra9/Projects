from __future__ import annotations

import re
from models.research_plan import ResearchPlan

FORBIDDEN_PATTERNS: list[tuple[str, str]] = [
    (r"os\.system\(", "Shell injection via os.system"),
    (r"subprocess\.call\(.*shell\s*=\s*True", "Shell injection via subprocess"),
    (r"\beval\s*\(", "Arbitrary code execution via eval"),
    (r"\bexec\s*\(", "Arbitrary code execution via exec"),
    (r"__import__\s*\(", "Dynamic import"),
    (r'open\s*\(["\']\/etc', "System file access"),
    (r"rm\s+-rf", "Destructive filesystem operation"),
    (r"DROP\s+TABLE", "Database destruction"),
    (r'shutil\.rmtree\s*\(["\']/', "Recursive deletion of system path"),
]


class SafetyMonitor:
    def __init__(self, plan: ResearchPlan):
        self.plan = plan

    def validate_diff(self, diff: str) -> tuple[bool, list[str]]:
        violations = []
        for pattern, description in FORBIDDEN_PATTERNS:
            if re.search(pattern, diff, re.IGNORECASE):
                violations.append(description)
        return len(violations) == 0, violations

    def validate_touched_files(self, changed_files: list[str]) -> tuple[bool, list[str]]:
        violations = []
        for f in changed_files:
            for forbidden in self.plan.constraints.forbidden_files:
                if forbidden in f or f.endswith(forbidden):
                    violations.append(f"Forbidden file touched: {f}")
        return len(violations) == 0, violations

    def check_budget_remaining(self, elapsed_seconds: float) -> bool:
        max_seconds = self.plan.constraints.max_total_hours * 3600
        return elapsed_seconds < max_seconds * 0.95

    def estimate_gpu_memory(self, diff: str) -> int:
        """Rough static estimate of GPU memory change from diff. Returns delta in MB."""
        if "d_model" in diff:
            return 2048
        return 512
