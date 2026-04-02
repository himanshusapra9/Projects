from __future__ import annotations
import json
import anthropic

def analyze_business_logic(diff: str, repo_context: str, auth_files: list[str]) -> list[dict]:
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system="You are a senior application security engineer. Find business logic vulnerabilities. Return ONLY valid JSON: list of findings.",
        messages=[{"role": "user", "content": f"AUTH CONTEXT:\n{auth_files}\n\nREPO:\n{repo_context[:2000]}\n\nDIFF:\n{diff[:4000]}\n\nReturn JSON array of findings or []."}],
    )
    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        return []

def analyze_business_logic_mock(diff: str) -> list[dict]:
    """Mock business logic analysis for testing."""
    findings = []
    if "admin" in diff.lower() and "auth" not in diff.lower():
        findings.append({
            "file": "routes.py",
            "line": 1,
            "severity": "CRITICAL",
            "cwe": "CWE-862",
            "title": "Missing Authorization Check",
            "description": "Admin endpoint without authentication middleware.",
            "evidence": diff[:100],
            "suggestion": "Add @require_auth decorator.",
            "auto_fixable": False,
            "confidence": 0.85,
        })
    return findings
