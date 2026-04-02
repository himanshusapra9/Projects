from __future__ import annotations

from typing import Any

from fastapi import APIRouter

router = APIRouter()


@router.get("/research/{task_id}/sources", response_model=dict, tags=["sources"])
async def get_sources(task_id: str) -> dict[str, Any]:
    return {
        "task_id": task_id,
        "sources": [],
        "total": 0,
    }
