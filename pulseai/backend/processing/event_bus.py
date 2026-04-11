from __future__ import annotations

import asyncio
import json
import logging
from collections import deque

logger = logging.getLogger("pulseai.event_bus")

_signal_queues: list[asyncio.Queue] = []
_signal_history: deque[dict] = deque(maxlen=200)
_metrics_state: dict = {
    "total_signals_today": 0,
    "avg_sentiment_score": 0.0,
    "top_topic": "none",
    "high_urgency_count": 0,
    "anomalies_detected": 0,
    "active_customers": 0,
}
_sentiment_sum: float = 0.0
_topic_counts: dict[str, int] = {}
_ws_clients: list[asyncio.Queue] = []


def get_metrics() -> dict:
    return dict(_metrics_state)


def get_recent_signals(n: int = 50) -> list[dict]:
    return list(_signal_history)[-n:]


def register_sse_queue() -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue(maxsize=256)
    _signal_queues.append(q)
    return q


def unregister_sse_queue(q: asyncio.Queue) -> None:
    if q in _signal_queues:
        _signal_queues.remove(q)


def register_ws_queue() -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue(maxsize=256)
    _ws_clients.append(q)
    return q


def unregister_ws_queue(q: asyncio.Queue) -> None:
    if q in _ws_clients:
        _ws_clients.remove(q)


async def broadcast_signal(signal: dict) -> None:
    global _sentiment_sum

    _signal_history.append(signal)
    _metrics_state["total_signals_today"] += 1

    sentiment_score = 0.0
    sent = signal.get("sentiment", {})
    if isinstance(sent, dict):
        sentiment_score = float(sent.get("score", 0))
    _sentiment_sum += sentiment_score
    total = _metrics_state["total_signals_today"]
    _metrics_state["avg_sentiment_score"] = round(_sentiment_sum / max(total, 1), 3)

    topics = signal.get("topics", [])
    for t in topics:
        _topic_counts[t] = _topic_counts.get(t, 0) + 1
    if _topic_counts:
        _metrics_state["top_topic"] = max(_topic_counts, key=_topic_counts.get)

    if signal.get("urgency_score", 0) >= 7:
        _metrics_state["high_urgency_count"] += 1

    payload = json.dumps(signal, default=str)

    for q in list(_signal_queues):
        try:
            q.put_nowait(payload)
        except asyncio.QueueFull:
            pass

    for q in list(_ws_clients):
        try:
            q.put_nowait(payload)
        except asyncio.QueueFull:
            pass
