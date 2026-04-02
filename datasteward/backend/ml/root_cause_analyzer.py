from __future__ import annotations
import json


def analyze_root_cause(incident: dict, pipeline_logs: str, recent_commits: str, source_health: dict) -> list[dict]:
    import anthropic
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system="You are a data engineering expert. Identify root causes. Return ONLY valid JSON.",
        messages=[{"role": "user", "content": f"ANOMALY:\n{json.dumps(incident)}\nLOGS:\n{pipeline_logs[:3000]}\nCOMMITS:\n{recent_commits[:1000]}\nSOURCE HEALTH:\n{json.dumps(source_health)}"}],
    )
    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        return [{"cause": "Unable to parse", "probability": 0.5, "remediation_steps": ["Investigate manually"], "auto_healable": False, "auto_heal_action": "alert_only"}]

def analyze_root_cause_mock(incident: dict) -> list[dict]:
    """Mock RCA for testing."""
    causes = []
    if "drop" in incident.get("anomaly_type", "").lower():
        causes.append({
            "cause": "Upstream source system outage",
            "probability": 0.65,
            "evidence": "Row count dropped significantly",
            "remediation_steps": ["Check source API status", "Trigger DAG rerun after recovery"],
            "auto_healable": True,
            "auto_heal_action": "trigger_dag_rerun",
        })
    elif "spike" in incident.get("anomaly_type", "").lower():
        causes.append({
            "cause": "Duplicate data ingestion from backfill",
            "probability": 0.60,
            "evidence": "Row count spike beyond normal bounds",
            "remediation_steps": ["Check for duplicate records", "Quarantine new records"],
            "auto_healable": True,
            "auto_heal_action": "quarantine_records",
        })
    else:
        causes.append({
            "cause": "Unknown anomaly",
            "probability": 0.50,
            "evidence": str(incident),
            "remediation_steps": ["Investigate manually"],
            "auto_healable": False,
            "auto_heal_action": "alert_only",
        })
    return causes
