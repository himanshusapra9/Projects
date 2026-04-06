from __future__ import annotations

import logging
import uuid
from typing import Any, AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.research_plan import ResearchRequest

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/research", response_model=dict, status_code=202, tags=["research"])
async def start_research(req: ResearchRequest) -> dict[str, Any]:
    task_id = str(uuid.uuid4())
    try:
        from tasks.celery_app import run_research_task

        run_research_task.delay(task_id, req.model_dump(mode="json"))
    except Exception:
        logger.exception("Failed to enqueue research task for task_id=%s", task_id)
    depth_key = (
        req.depth.value if hasattr(req.depth, "value") else str(req.depth)
    )
    return {
        "task_id": task_id,
        "status_url": f"/api/v1/research/{task_id}/status",
        "estimated_seconds": {"quick": 120, "standard": 480, "deep": 1500}.get(
            depth_key, 480
        ),
    }


@router.get("/research/{task_id}/status", response_model=dict, tags=["research"])
async def get_status(task_id: str) -> dict[str, Any]:
    from db.redis_client import get_task_status

    status = get_task_status(task_id)
    if status is None:
        return {"task_id": task_id, "status": "pending", "progress": 0}
    return {"task_id": task_id, **status}


@router.get("/research/{task_id}/stream", tags=["research"])
async def stream_synthesis(task_id: str) -> StreamingResponse:
    async def event_stream() -> AsyncIterator[str]:
        yield f'data: {{"task_id": "{task_id}", "status": "streaming"}}\n\n'
        yield 'data: {"status": "done"}\n\n'

    return StreamingResponse(event_stream(), media_type="text/event-stream")
