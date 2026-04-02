from __future__ import annotations
import re
from backend.models.finding import Finding

SECRET_PATTERNS: list[tuple[str, str, str]] = [
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID", "CWE-798"),
    (r"(?i)aws.{0,20}secret.{0,20}['\"][0-9a-zA-Z/+]{40}['\"]", "AWS Secret Key", "CWE-798"),
    (r"ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token", "CWE-798"),
    (r"gho_[0-9a-zA-Z]{36}", "GitHub OAuth Token", "CWE-798"),
    (r"sk-[0-9a-zA-Z]{48}", "OpenAI API Key", "CWE-798"),
    (r"xox[baprs]-[0-9a-zA-Z-]{10,}", "Slack Token", "CWE-798"),
    (r"(?i)password\s*=\s*['\"][^'\"]{8,}['\"]", "Hardcoded Password", "CWE-259"),
    (r"(?i)api[_-]?key\s*=\s*['\"][a-zA-Z0-9]{20,}['\"]", "Hardcoded API Key", "CWE-798"),
    (r"-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----", "Private Key", "CWE-321"),
    (r"(?i)bearer\s+[a-zA-Z0-9\-._~+/]+=*", "Bearer Token", "CWE-798"),
]

EXAMPLE_PATTERNS: list[str] = [
    "example", "test", "dummy", "placeholder", "your_", "xxx", "TODO",
    "REPLACE_ME", "changeme", "insert_here", "fake",
]

def detect_secrets(code: str, file_path: str = "") -> list[Finding]:
    findings = []
    for line_num, line in enumerate(code.split("\n"), 1):
        for pattern, name, cwe in SECRET_PATTERNS:
            matches = re.finditer(pattern, line)
            for match in matches:
                matched_text = match.group(0)
                if _is_example(matched_text, line):
                    continue
                findings.append(Finding(
                    file=file_path,
                    line=line_num,
                    severity="CRITICAL",
                    cwe=cwe,
                    title=f"Hardcoded {name}",
                    description=f"Found what appears to be a {name} hardcoded in source code.",
                    evidence=_redact(matched_text),
                    suggestion=f"Move this {name} to environment variables or a secrets manager.",
                    confidence=0.90,
                    source="secret",
                ))
    return findings

def _is_example(matched_text: str, line: str) -> bool:
    combined = (matched_text + " " + line).lower()
    return any(ex in combined for ex in EXAMPLE_PATTERNS)

def _redact(text: str) -> str:
    if len(text) <= 8:
        return "***REDACTED***"
    return text[:4] + "..." + text[-4:]
