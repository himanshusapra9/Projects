"""Tests for finding deduplication and aggregation."""
import pytest
from backend.models.finding import Finding
from backend.analysis.aggregator import deduplicate_findings, filter_false_positives, sort_by_severity


def test_deduplicate_removes_exact_duplicates():
    f1 = Finding(file="app.py", line=10, cwe="CWE-89", title="SQL Injection")
    f2 = Finding(file="app.py", line=10, cwe="CWE-89", title="SQL Injection")
    f3 = Finding(file="app.py", line=20, cwe="CWE-79", title="XSS")
    result = deduplicate_findings([f1, f2, f3])
    assert len(result) == 2


def test_deduplicate_keeps_different_lines():
    f1 = Finding(file="app.py", line=10, cwe="CWE-89", title="SQL Injection")
    f2 = Finding(file="app.py", line=20, cwe="CWE-89", title="SQL Injection")
    result = deduplicate_findings([f1, f2])
    assert len(result) == 2


def test_filter_low_confidence():
    f1 = Finding(confidence=0.9, title="High confidence")
    f2 = Finding(confidence=0.3, title="Low confidence")
    result = filter_false_positives([f1, f2], min_confidence=0.5)
    assert len(result) == 1
    assert result[0].title == "High confidence"


def test_sort_by_severity_order():
    findings = [
        Finding(severity="LOW"),
        Finding(severity="CRITICAL"),
        Finding(severity="MEDIUM"),
        Finding(severity="HIGH"),
    ]
    sorted_findings = sort_by_severity(findings)
    assert sorted_findings[0].severity == "CRITICAL"
    assert sorted_findings[1].severity == "HIGH"
    assert sorted_findings[2].severity == "MEDIUM"
    assert sorted_findings[3].severity == "LOW"
