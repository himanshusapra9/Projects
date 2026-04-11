from __future__ import annotations

import asyncio
import json
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.config import settings
from backend.ml.customer_predictor import CustomerPredictor
from backend.ml.groq_analyzer import analyze_transaction_behavior
from backend.models.customer import CustomerAnalysisRequest, CustomerAnalysisResponse
from backend.processing.event_bus import (
    get_metrics,
    get_recent_signals,
    register_sse_queue,
    register_ws_queue,
    unregister_sse_queue,
    unregister_ws_queue,
)
from backend.processing.pipeline import analyze_realtime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pulseai")

app = FastAPI(title="PulseAI API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = CustomerPredictor()


# ── Existing endpoints (preserved) ──────────────────────────────────────────

@app.get("/health")
def health():
    from backend.ml.groq_client import GroqClient

    return {
        "status": "ok",
        "groq_available": GroqClient().available,
        "version": "2.0.0",
    }


@app.post("/api/v1/webhooks/{platform}")
async def receive_webhook(platform: str, payload: dict):
    text = ""
    if platform == "intercom":
        text = payload.get("data", {}).get("item", {}).get("body", "")
    elif platform == "zendesk":
        text = payload.get("ticket", {}).get("description", "")
    else:
        text = payload.get("text", payload.get("message", ""))

    result = {"status": "received", "platform": platform}

    if text:
        signal = {"text": text, "source_platform": platform, "raw": payload}
        analysis = await analyze_realtime(signal)
        result["analysis"] = analysis

    return result


@app.get("/api/v1/insights")
async def get_insights():
    recent = get_recent_signals(50)
    return {"insights": recent, "count": len(recent)}


@app.get("/api/v1/briefing/{date_str}")
async def get_briefing(date_str: str):
    return {"date": date_str, "narrative": "No briefing generated yet."}


@app.get("/api/v1/export/roadmap-csv")
async def export_roadmap():
    return {"status": "not_implemented"}


# ── SSE Streaming ───────────────────────────────────────────────────────────

@app.get("/api/v1/stream/signals")
async def stream_signals():
    async def event_generator():
        queue = register_sse_queue()
        try:
            while True:
                try:
                    data = await asyncio.wait_for(
                        queue.get(), timeout=settings.sse_heartbeat_interval
                    )
                    yield f"data: {data}\n\n"
                except asyncio.TimeoutError:
                    yield 'data: {"type":"heartbeat"}\n\n'
        except asyncio.CancelledError:
            pass
        finally:
            unregister_sse_queue(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/v1/stream/metrics")
async def stream_metrics():
    async def metrics_generator():
        while True:
            metrics = get_metrics()
            yield f"data: {json.dumps(metrics)}\n\n"
            await asyncio.sleep(10)

    return StreamingResponse(metrics_generator(), media_type="text/event-stream")


# ── WebSocket ───────────────────────────────────────────────────────────────

@app.websocket("/ws/dashboard")
async def ws_dashboard(websocket: WebSocket):
    await websocket.accept()
    queue = register_ws_queue()

    recent = get_recent_signals(50)
    await websocket.send_json({"type": "history", "signals": recent})

    try:
        while True:
            try:
                data = await asyncio.wait_for(queue.get(), timeout=settings.ws_ping_interval)
                await websocket.send_text(data)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "ping"})
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        unregister_ws_queue(queue)


# ── Customer Analysis ───────────────────────────────────────────────────────

@app.post("/api/v1/customers/analyze", response_model=CustomerAnalysisResponse)
async def analyze_customers(request: CustomerAnalysisRequest):
    customers_raw = [c.model_dump() for c in request.customers]

    all_transactions = []
    for c in customers_raw:
        for t in c.get("transactions", []):
            all_transactions.append(
                {
                    "customer_id": c["customer_id"],
                    "amount": t["amount"],
                    "timestamp": t["timestamp"].isoformat() if hasattr(t["timestamp"], "isoformat") else str(t["timestamp"]),
                    "product": t.get("product", ""),
                }
            )

    cohorts = predictor.build_cohorts(customers_raw)
    rfm_segments = predictor.compute_rfm(all_transactions)

    daily_counts: dict[str, int] = {}
    for c in customers_raw:
        fs = c.get("first_seen")
        if fs:
            key = fs.isoformat() if hasattr(fs, "isoformat") else str(fs)
            daily_counts[key] = daily_counts.get(key, 0) + 1
    historical = [{"date": d, "count": n} for d, n in sorted(daily_counts.items())]
    arrival_forecast = predictor.predict_arrivals(historical)

    behavioral_insights = []
    sample_customers = customers_raw[: settings.max_customers_per_groq_batch]
    for cust in sample_customers:
        txns = [
            {"amount": t["amount"], "timestamp": str(t["timestamp"]), "product": t.get("product", "")}
            for t in cust.get("transactions", [])
        ]
        if txns:
            insight = await analyze_transaction_behavior(txns)
            insight["customer_id"] = cust["customer_id"]
            behavioral_insights.append(insight)

    at_risk = [r for r in rfm_segments if r.get("segment") in ("at_risk", "lost")]

    segment_counts: dict[str, int] = {}
    for r in rfm_segments:
        seg = r.get("segment", "unknown")
        segment_counts[seg] = segment_counts.get(seg, 0) + 1
    total = max(len(rfm_segments), 1)

    summary = {
        "total_analyzed": len(customers_raw),
        "champions_pct": round(segment_counts.get("champions", 0) / total * 100, 1),
        "at_risk_pct": round(
            (segment_counts.get("at_risk", 0) + segment_counts.get("lost", 0)) / total * 100, 1
        ),
        "predicted_arrivals_7d": sum(f["predicted_count"] for f in arrival_forecast.get("forecast", [])),
    }

    return CustomerAnalysisResponse(
        cohorts=cohorts,
        rfm_segments=rfm_segments,
        arrival_forecast=arrival_forecast,
        behavioral_insights=behavioral_insights,
        at_risk_customers=at_risk,
        summary=summary,
    )


@app.get("/api/v1/customers/forecast")
async def customer_forecast():
    recent = get_recent_signals(200)
    daily_counts: dict[str, int] = {}
    for sig in recent:
        date_str = sig.get("processed_at", "")[:10]
        if date_str:
            daily_counts[date_str] = daily_counts.get(date_str, 0) + 1

    historical = [{"date": d, "count": n} for d, n in sorted(daily_counts.items())]
    forecast = predictor.predict_arrivals(historical)
    return forecast


# ── Realtime analysis endpoint ──────────────────────────────────────────────

@app.post("/api/v1/analyze")
async def analyze_signal(payload: dict):
    """Direct signal analysis endpoint."""
    result = await analyze_realtime(payload)
    return result
