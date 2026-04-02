from __future__ import annotations
from backend.models.finding import Finding

def deduplicate_findings(findings: list[Finding]) -> list[Finding]:
    seen = set()
    unique = []
    for f in findings:
        key = (f.file, f.line, f.cwe, f.title)
        if key not in seen:
            seen.add(key)
            unique.append(f)
    return unique

def filter_false_positives(findings: list[Finding], min_confidence: float = 0.5) -> list[Finding]:
    return [f for f in findings if f.confidence >= min_confidence]

def sort_by_severity(findings: list[Finding]) -> list[Finding]:
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    return sorted(findings, key=lambda f: severity_order.get(f.severity, 4))
