from __future__ import annotations
import re
from backend.models.finding import Finding

STATIC_RULES: list[dict] = [
    {
        "id": "sql-injection",
        "pattern": r"(?:execute|cursor\.execute)\s*\(\s*[\"'].*%s.*[\"']\s*%",
        "alt_pattern": r"f[\"'].*(?:SELECT|INSERT|UPDATE|DELETE|DROP).*\{",
        "severity": "CRITICAL",
        "cwe": "CWE-89",
        "title": "SQL Injection",
        "description": "User input may be interpolated directly into SQL query.",
    },
    {
        "id": "xss",
        "pattern": r"innerHTML\s*=\s*(?!.*sanitize)",
        "severity": "HIGH",
        "cwe": "CWE-79",
        "title": "Cross-Site Scripting (XSS)",
        "description": "Dynamic content assigned to innerHTML without sanitization.",
    },
    {
        "id": "path-traversal",
        "pattern": r"open\s*\(.*\+.*(?:request|params|query|input|user)",
        "severity": "HIGH",
        "cwe": "CWE-22",
        "title": "Path Traversal",
        "description": "File path constructed from user input without validation.",
    },
    {
        "id": "eval-injection",
        "pattern": r"\beval\s*\(.*(?:request|params|query|input|user)",
        "severity": "CRITICAL",
        "cwe": "CWE-94",
        "title": "Code Injection via eval()",
        "description": "User-controlled input passed to eval().",
    },
    {
        "id": "weak-crypto",
        "pattern": r"(?:md5|sha1)\s*\(",
        "severity": "MEDIUM",
        "cwe": "CWE-328",
        "title": "Weak Cryptographic Hash",
        "description": "Use of MD5 or SHA1 which are cryptographically broken.",
    },
    {
        "id": "insecure-random",
        "pattern": r"(?:Math\.random|random\.random)\s*\(",
        "severity": "MEDIUM",
        "cwe": "CWE-330",
        "title": "Insecure Randomness",
        "description": "Non-cryptographic random used in security context.",
    },
    {
        "id": "hardcoded-ip",
        "pattern": r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b(?!.*(?:0\.0\.0\.0|127\.0\.0\.1|localhost))",
        "severity": "LOW",
        "cwe": "CWE-798",
        "title": "Hardcoded IP Address",
        "description": "IP address hardcoded in source code.",
    },
]

def run_static_analysis(code: str, file_path: str = "") -> list[Finding]:
    findings = []
    lines = code.split("\n")
    for line_num, line in enumerate(lines, 1):
        for rule in STATIC_RULES:
            patterns = [rule["pattern"]]
            if "alt_pattern" in rule:
                patterns.append(rule["alt_pattern"])
            for pat in patterns:
                if re.search(pat, line, re.IGNORECASE):
                    findings.append(Finding(
                        file=file_path,
                        line=line_num,
                        severity=rule["severity"],
                        cwe=rule["cwe"],
                        title=rule["title"],
                        description=rule["description"],
                        evidence=line.strip()[:200],
                        suggestion=f"Review and fix {rule['title']} vulnerability.",
                        confidence=0.80,
                        source="static",
                    ))
                    break
    return findings
