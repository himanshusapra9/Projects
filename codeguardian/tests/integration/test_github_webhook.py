"""Integration test: full GitHub PR webhook → findings generated."""
import pytest
from backend.github_app.webhook_handler import handle_pull_request_event


def test_pr_event_with_sql_injection():
    payload = {
        "action": "opened",
        "pull_request": {
            "number": 42,
            "head": {"sha": "abc123def456"},
        },
        "repository": {"full_name": "org/repo"},
        "diff": 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
    }
    result = handle_pull_request_event(payload)
    assert result.repo == "org/repo"
    assert result.pr_number == 42
    assert len(result.findings) > 0
    assert any(f.cwe == "CWE-89" for f in result.findings)


def test_pr_event_with_secret():
    payload = {
        "action": "opened",
        "pull_request": {
            "number": 43,
            "head": {"sha": "def789"},
        },
        "repository": {"full_name": "org/repo"},
        "diff": 'API_KEY = "AKIAIOSFODNN7ABCDEFG"',
    }
    result = handle_pull_request_event(payload)
    assert len(result.findings) > 0
    assert result.critical_count > 0


def test_pr_event_clean_code():
    payload = {
        "action": "opened",
        "pull_request": {
            "number": 44,
            "head": {"sha": "clean123"},
        },
        "repository": {"full_name": "org/repo"},
        "diff": "def hello():\n    return 'world'",
    }
    result = handle_pull_request_event(payload)
    assert result.critical_count == 0


def test_pr_event_wrong_action_ignored():
    payload = {
        "action": "closed",
        "pull_request": {"number": 45, "head": {"sha": "xxx"}},
        "repository": {"full_name": "org/repo"},
        "diff": 'eval(request.form["code"])',
    }
    result = handle_pull_request_event(payload)
    assert len(result.findings) == 0


def test_scan_duration_recorded():
    payload = {
        "action": "synchronize",
        "pull_request": {"number": 46, "head": {"sha": "sync123"}},
        "repository": {"full_name": "org/repo"},
        "diff": 'x = 1 + 1',
    }
    result = handle_pull_request_event(payload)
    assert result.scan_duration_seconds >= 0
