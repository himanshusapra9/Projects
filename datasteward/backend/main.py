from __future__ import annotations

import json
import time
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.config import get_anthropic_key, get_uptime, is_claude_available, is_demo_mode
from backend.demo.seed_data import generate_incidents, generate_tables
from backend.ml.root_cause_analyzer import analyze_root_cause, analyze_root_cause_mock

app = FastAPI(title="DataSteward API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory stores
# ---------------------------------------------------------------------------
_tables: dict[str, dict] = {}
_incidents: dict[str, dict] = {}
_profile_history: dict[str, list[dict]] = {}


def _ensure_demo_loaded() -> None:
    if not is_demo_mode():
        return
    if not _tables:
        for t in generate_tables():
            _tables[t["id"]] = t
            _profile_history[t["id"]] = t.get("history", [])
    if not _incidents:
        for inc in generate_incidents():
            _incidents[inc["id"]] = inc


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class RegisterTableRequest(BaseModel):
    name: str
    connection_string: str = ""
    schedule_cron: str = "0 * * * *"


class PatchIncidentRequest(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None


# ---------------------------------------------------------------------------
# Health (backward-compatible — still returns "status" key)
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    _ensure_demo_loaded()
    open_count = sum(1 for i in _incidents.values() if i.get("status") == "open")
    return {
        "status": "healthy",
        "version": "2.0.0",
        "tables_monitored": len(_tables),
        "open_incidents": open_count,
        "claude_available": is_claude_available(),
        "uptime_seconds": get_uptime(),
    }


# ---------------------------------------------------------------------------
# Tables
# ---------------------------------------------------------------------------

@app.get("/api/v1/tables")
async def list_tables():
    _ensure_demo_loaded()
    summary = []
    for t in _tables.values():
        summary.append({
            "id": t["id"],
            "name": t["name"],
            "row_count": t.get("row_count", 0),
            "last_profiled": t.get("last_profiled", ""),
            "health": t.get("health", "healthy"),
            "drift_status": t.get("drift_status", "OK"),
        })
    return {"tables": summary}


@app.post("/api/v1/tables/register")
async def register_table(req: RegisterTableRequest):
    table_id = f"tbl_{uuid.uuid4().hex[:8]}"
    _tables[table_id] = {
        "id": table_id,
        "name": req.name,
        "connection_string": req.connection_string,
        "schedule_cron": req.schedule_cron,
        "row_count": 0,
        "last_profiled": None,
        "health": "healthy",
        "drift_status": "OK",
        "history": [],
        "column_stats": [],
        "drift_results": [],
        "anomalies": [],
        "duplicates": [],
    }
    _profile_history[table_id] = []
    return {"table_id": table_id, "status": "registered"}


@app.get("/api/v1/tables/{table_id}")
async def get_table_detail(table_id: str):
    _ensure_demo_loaded()
    if table_id not in _tables:
        return {"error": "Table not found"}, 404
    return _tables[table_id]


@app.post("/api/v1/tables/{table_id}/profile")
async def trigger_profile(table_id: str):
    _ensure_demo_loaded()
    if table_id not in _tables:
        return {"error": "Table not found"}
    t = _tables[table_id]
    now = datetime.utcnow().isoformat() + "Z"
    profile = {
        "row_count": t.get("row_count", 0),
        "column_stats": t.get("column_stats", []),
        "null_rates": {},
        "computed_at": now,
    }
    t["last_profiled"] = now
    _profile_history.setdefault(table_id, []).append({
        "date": now[:10],
        "count": t.get("row_count", 0),
        "baseline_mean": 0,
        "baseline_upper": 0,
        "baseline_lower": 0,
        "is_anomaly": False,
    })
    return profile


@app.get("/api/v1/tables/{table_id}/history")
async def get_table_history(table_id: str):
    _ensure_demo_loaded()
    history = _profile_history.get(table_id, [])
    return {"table_id": table_id, "history": history[-30:]}


# Backward-compatible legacy endpoints

@app.get("/api/v1/tables/{table_name}/score")
async def get_table_score(table_name: str):
    return {"table_name": table_name, "overall_score": 100.0}


@app.get("/api/v1/tables/{table_name}/profile")
async def get_table_profile(table_name: str):
    return {"table_name": table_name, "message": "Profile not computed yet"}


# ---------------------------------------------------------------------------
# Incidents
# ---------------------------------------------------------------------------

@app.get("/api/v1/incidents")
async def list_incidents(
    status: str = Query("all", regex="^(all|open|resolved|snoozed)$"),
    severity: Optional[str] = Query(None, regex="^(critical|high|medium|low)$"),
):
    _ensure_demo_loaded()
    results = list(_incidents.values())

    if status != "all":
        results = [i for i in results if i.get("status") == status]
    if severity:
        results = [i for i in results if i.get("severity") == severity]

    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    results.sort(key=lambda i: (severity_order.get(i.get("severity", "low"), 9), i.get("created_at", "")))

    return {"incidents": results}


@app.get("/api/v1/incidents/{incident_id}")
async def get_incident(incident_id: str):
    _ensure_demo_loaded()
    if incident_id not in _incidents:
        return {"error": "Incident not found"}
    return _incidents[incident_id]


@app.patch("/api/v1/incidents/{incident_id}")
async def patch_incident(incident_id: str, req: PatchIncidentRequest):
    _ensure_demo_loaded()
    if incident_id not in _incidents:
        return {"error": "Incident not found"}
    inc = _incidents[incident_id]
    if req.status:
        inc["status"] = req.status
        if req.status == "resolved":
            inc["resolved_at"] = datetime.utcnow().isoformat() + "Z"
    if req.note:
        inc.setdefault("notes", []).append({
            "text": req.note,
            "created_at": datetime.utcnow().isoformat() + "Z",
        })
    return inc


# ---------------------------------------------------------------------------
# Root Cause Analysis (streaming)
# ---------------------------------------------------------------------------

def _stream_text(text: str):
    """Yield SSE chunks from a static text string."""
    words = text.split(" ")
    chunk = []
    for w in words:
        chunk.append(w)
        if len(chunk) >= 5:
            yield f"data: {json.dumps({'chunk': ' '.join(chunk) + ' '})}\n\n"
            chunk = []
    if chunk:
        yield f"data: {json.dumps({'chunk': ' '.join(chunk)})}\n\n"
    yield "data: [DONE]\n\n"


def _stream_claude_rca(description: str):
    """Stream RCA from Claude via Anthropic SDK."""
    try:
        import anthropic

        client = anthropic.Anthropic()
        system_prompt = (
            "You are a senior data engineer investigating a data quality incident. "
            "Provide a root cause analysis in markdown. Include: most likely cause, "
            "evidence, and specific remediation steps. Be concise but thorough."
        )
        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=system_prompt,
            messages=[{"role": "user", "content": description}],
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'chunk': text})}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        fallback = analyze_root_cause_mock({"anomaly_type": description})
        text = json.dumps(fallback, indent=2)
        yield f"data: {json.dumps({'chunk': text})}\n\n"
        yield "data: [DONE]\n\n"


@app.get("/api/v1/rca/stream")
async def rca_stream(
    incident_id: Optional[str] = Query(None),
    description: Optional[str] = Query(None),
):
    _ensure_demo_loaded()

    # If incident_id provided and we have a pre-written RCA (demo mode), use it
    if incident_id and incident_id in _incidents:
        inc = _incidents[incident_id]
        if inc.get("root_cause"):
            return StreamingResponse(
                _stream_text(inc["root_cause"]),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
            )
        desc = inc.get("description", "Unknown anomaly")
    elif description:
        desc = description
    else:
        return StreamingResponse(
            _stream_text("No incident or description provided."),
            media_type="text/event-stream",
        )

    if is_claude_available():
        return StreamingResponse(
            _stream_claude_rca(desc),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    # Fallback: mock RCA
    fallback = analyze_root_cause_mock({"anomaly_type": desc})
    fallback_text = (
        "**Rule-based analysis** (add ANTHROPIC_API_KEY for AI-powered analysis):\n\n"
        + json.dumps(fallback, indent=2)
    )
    return StreamingResponse(
        _stream_text(fallback_text),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
