from __future__ import annotations
import httpx
from backend.models.finding import Finding

OSV_API_URL = "https://api.osv.dev/v1/query"

async def scan_dependency(package_name: str, version: str, ecosystem: str = "PyPI") -> list[Finding]:
    """Query the OSV database for known vulnerabilities."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                OSV_API_URL,
                json={"package": {"name": package_name, "ecosystem": ecosystem}, "version": version},
            )
            data = resp.json()
    except Exception:
        return []
    
    findings = []
    for vuln in data.get("vulns", []):
        severity = _cvss_to_severity(vuln)
        findings.append(Finding(
            file="requirements.txt",
            line=0,
            severity=severity,
            cwe=_extract_cwe(vuln),
            title=f"Vulnerable dependency: {package_name}=={version}",
            description=vuln.get("summary", vuln.get("details", "")[:200]),
            evidence=f"{package_name}=={version}",
            suggestion=f"Upgrade {package_name} to a patched version.",
            confidence=0.95,
            source="dependency",
            references=[ref.get("url", "") for ref in vuln.get("references", [])[:3]],
        ))
    return findings

def scan_dependency_mock(package_name: str, version: str, cve_id: str = "", cvss: float = 0.0) -> list[Finding]:
    """Mock scanner for testing."""
    if not cve_id:
        return []
    severity = "CRITICAL" if cvss >= 9.0 else "HIGH" if cvss >= 7.0 else "MEDIUM" if cvss >= 4.0 else "LOW"
    return [Finding(
        file="requirements.txt",
        severity=severity,
        cwe="CWE-1035",
        title=f"Vulnerable dependency: {package_name}=={version} ({cve_id})",
        description=f"Known vulnerability {cve_id} with CVSS {cvss}",
        evidence=f"{package_name}=={version}",
        suggestion=f"Upgrade {package_name}.",
        confidence=0.95,
        source="dependency",
    )]

def _cvss_to_severity(vuln: dict) -> str:
    for sev in vuln.get("severity", []):
        score = float(sev.get("score", "0").split("/")[0]) if "/" in str(sev.get("score", "")) else float(sev.get("score", 0))
        if score >= 9.0: return "CRITICAL"
        if score >= 7.0: return "HIGH"
        if score >= 4.0: return "MEDIUM"
    return "MEDIUM"

def _extract_cwe(vuln: dict) -> str:
    for ref in vuln.get("references", []):
        url = ref.get("url", "")
        if "cwe.mitre.org" in url:
            return url.split("/")[-1] if "/" in url else ""
    return "CWE-1035"
