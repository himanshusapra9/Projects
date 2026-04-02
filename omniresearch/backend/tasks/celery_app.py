from __future__ import annotations

from typing import Any

from celery import Celery

from config import settings

celery_app = Celery(
    "omniresearch", broker=settings.redis_url, backend=settings.redis_url
)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="run_research_task")
def run_research_task(task_id: str, request_data: dict[str, Any]) -> dict[str, Any]:
    from db.redis_client import set_task_status

    try:
        set_task_status(task_id, {"status": "running", "progress": 0})
        set_task_status(task_id, {"status": "completed", "progress": 100})
        return {"task_id": task_id, "status": "completed"}
    except Exception as e:
        set_task_status(task_id, {"status": "failed", "error": str(e)})
        return {"task_id": task_id, "status": "failed", "error": str(e)}
