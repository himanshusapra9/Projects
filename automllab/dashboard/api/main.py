from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.memory_engine import MemoryEngine

app = FastAPI(title="AutoMLab Dashboard API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_memory: MemoryEngine | None = None


def get_memory() -> MemoryEngine:
    global _memory
    if _memory is None:
        _memory = MemoryEngine(".automllab/experiments.db")
    return _memory


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/v1/experiments")
def list_experiments() -> list[dict]:
    return get_memory().load_all()


@app.get("/api/v1/experiments/best")
def get_best_experiment() -> dict:
    best = get_memory().get_best()
    if best is None:
        return {"message": "No kept experiments yet"}
    return best


@app.get("/api/v1/report")
def get_report() -> dict:
    from pathlib import Path

    report_path = Path(".automllab/report.md")
    if report_path.exists():
        return {"narrative": report_path.read_text()}
    return {"narrative": "No report generated yet."}
