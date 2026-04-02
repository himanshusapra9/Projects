from __future__ import annotations
from backend.models.finding import Finding
from backend.models.scan_result import ScanResult
from backend.analysis.static_rules import run_static_analysis
from backend.analysis.secret_detector import detect_secrets
from backend.analysis.aggregator import deduplicate_findings, sort_by_severity
import time

def handle_pull_request_event(payload: dict) -> ScanResult:
    action = payload.get("action", "")
    if action not in ("opened", "synchronize", "reopened"):
        return ScanResult()
    
    pr = payload.get("pull_request", {})
    repo = payload.get("repository", {}).get("full_name", "")
    commit_sha = pr.get("head", {}).get("sha", "")
    pr_number = pr.get("number", 0)
    diff = payload.get("diff", "")
    
    start = time.time()
    findings: list[Finding] = []
    findings.extend(run_static_analysis(diff, file_path="diff"))
    findings.extend(detect_secrets(diff, file_path="diff"))
    findings = deduplicate_findings(findings)
    findings = sort_by_severity(findings)
    duration = time.time() - start
    
    result = ScanResult(
        repo=repo,
        commit_sha=commit_sha,
        pr_number=pr_number,
        findings=findings,
        scan_duration_seconds=duration,
    )
    result.compute_counts()
    return result
