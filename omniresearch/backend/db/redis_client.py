from __future__ import annotations

import json
from typing import Any, Optional

from config import settings

_redis_client: Optional[Any] = None


def get_redis_client() -> Optional[Any]:
    global _redis_client
    if _redis_client is None:
        try:
            import redis

            _redis_client = redis.from_url(
                settings.redis_url, socket_connect_timeout=5.0
            )
        except Exception:
            return None
    return _redis_client


def set_task_status(task_id: str, status: dict[str, Any]) -> None:
    client = get_redis_client()
    if client:
        client.set(f"research:{task_id}", json.dumps(status), ex=86400)


def get_task_status(task_id: str) -> Optional[dict[str, Any]]:
    client = get_redis_client()
    if client:
        data = client.get(f"research:{task_id}")
        if data:
            raw: bytes | str = data
            if isinstance(raw, bytes):
                return json.loads(raw.decode("utf-8"))
            return json.loads(str(raw))
    return None
