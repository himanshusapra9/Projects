"""Tests for static analysis rules — OWASP Top 10 samples."""
import pytest
from backend.analysis.static_rules import run_static_analysis


def test_sql_injection_fstring():
    code = 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")'
    findings = run_static_analysis(code, "app.py")
    assert any(f.cwe == "CWE-89" for f in findings), "SQL injection should be detected"


def test_sql_injection_percent():
    code = 'cursor.execute("SELECT * FROM users WHERE id = %s" % user_id)'
    findings = run_static_analysis(code, "app.py")
    assert any(f.cwe == "CWE-89" for f in findings)


def test_xss_innerhtml():
    code = 'element.innerHTML = userInput;'
    findings = run_static_analysis(code, "app.js")
    assert any(f.cwe == "CWE-79" for f in findings), "XSS should be detected"


def test_path_traversal():
    code = 'open("/data/" + request.args.get("file"))'
    findings = run_static_analysis(code, "app.py")
    assert any(f.cwe == "CWE-22" for f in findings), "Path traversal should be detected"


def test_eval_injection():
    code = 'eval(request.form["code"])'
    findings = run_static_analysis(code, "app.py")
    assert any(f.cwe == "CWE-94" for f in findings), "Code injection should be detected"


def test_weak_crypto():
    code = 'hash_val = md5(password)'
    findings = run_static_analysis(code, "auth.py")
    assert any(f.cwe == "CWE-328" for f in findings), "Weak crypto should be detected"


def test_clean_code_no_findings():
    code = """
import hashlib
def get_user(user_id: int):
    return db.session.query(User).filter(User.id == user_id).first()
"""
    findings = run_static_analysis(code, "app.py")
    critical = [f for f in findings if f.severity in ("CRITICAL", "HIGH")]
    assert len(critical) == 0, "Clean code should not have critical/high findings"


def test_severity_is_valid():
    code = 'cursor.execute(f"DELETE FROM users WHERE id = {uid}")'
    findings = run_static_analysis(code, "app.py")
    for f in findings:
        assert f.severity in ("CRITICAL", "HIGH", "MEDIUM", "LOW")
