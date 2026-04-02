"""Tests for dependency scanning — mock OSV responses."""
import pytest
from backend.analysis.dependency_scanner import scan_dependency_mock


def test_known_cve_flagged():
    findings = scan_dependency_mock(
        package_name="requests",
        version="2.25.0",
        cve_id="CVE-2023-32681",
        cvss=7.5,
    )
    assert len(findings) == 1
    assert findings[0].severity == "HIGH"
    assert "CVE-2023-32681" in findings[0].title


def test_critical_cvss_mapped():
    findings = scan_dependency_mock(
        package_name="log4j",
        version="2.14.0",
        cve_id="CVE-2021-44228",
        cvss=10.0,
    )
    assert len(findings) == 1
    assert findings[0].severity == "CRITICAL"


def test_no_cve_no_findings():
    findings = scan_dependency_mock(
        package_name="requests",
        version="2.31.0",
        cve_id="",
        cvss=0.0,
    )
    assert len(findings) == 0


def test_medium_cvss_mapped():
    findings = scan_dependency_mock(
        package_name="flask",
        version="2.0.0",
        cve_id="CVE-2023-12345",
        cvss=5.5,
    )
    assert len(findings) == 1
    assert findings[0].severity == "MEDIUM"


def test_finding_has_suggestion():
    findings = scan_dependency_mock(
        package_name="django",
        version="3.2.0",
        cve_id="CVE-2023-99999",
        cvss=8.0,
    )
    assert findings[0].suggestion
    assert "django" in findings[0].suggestion.lower() or "Upgrade" in findings[0].suggestion
