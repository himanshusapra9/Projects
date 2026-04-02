"""Tests for secret detection — known formats detected, examples ignored."""
import pytest
from backend.analysis.secret_detector import detect_secrets


def test_aws_access_key_detected():
    code = 'aws_key = "AKIAIOSFODNN7REALKEYZ"'
    findings = detect_secrets(code, "config.py")
    assert len(findings) > 0
    assert any("AWS" in f.title for f in findings)


def test_github_token_detected():
    code = 'token = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh12"'
    findings = detect_secrets(code, "auth.py")
    assert len(findings) > 0
    assert any("GitHub" in f.title for f in findings)


def test_private_key_detected():
    code = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpA...'
    findings = detect_secrets(code, "key.pem")
    assert len(findings) > 0
    assert any("Private Key" in f.title for f in findings)


def test_openai_key_detected():
    code = 'api_key = "sk-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmn"'
    findings = detect_secrets(code, "config.py")
    assert len(findings) > 0


def test_example_key_not_detected():
    code = 'aws_key = "AKIAIOSFODNN7example_test_key_placeholder"'
    findings = detect_secrets(code, "config.py")
    assert len(findings) == 0, "Example/test keys should be filtered out"


def test_placeholder_not_detected():
    code = 'api_key = "your_api_key_here_REPLACE_ME"'
    findings = detect_secrets(code, "config.py")
    assert len(findings) == 0, "Placeholder keys should be filtered out"


def test_clean_code_no_secrets():
    code = """
import os
api_key = os.environ.get("API_KEY")
token = get_secret("github_token")
"""
    findings = detect_secrets(code, "app.py")
    assert len(findings) == 0


def test_evidence_is_redacted():
    code = 'key = "AKIAIOSFODNN7ABCDEFG"'
    findings = detect_secrets(code, "config.py")
    if findings:
        assert "..." in findings[0].evidence or "REDACT" in findings[0].evidence
