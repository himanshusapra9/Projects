from __future__ import annotations

from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


async def fetch_huggingface_models(
    query: str, token: str = "", max_results: int = 20
) -> list[dict[str, Any]]:
    headers: dict[str, str] = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://huggingface.co/api/models",
                params={
                    "search": query,
                    "limit": min(max_results, 30),
                    "sort": "downloads",
                    "direction": "-1",
                },
                headers=headers,
            )
            resp.raise_for_status()
            models = resp.json()
            if not isinstance(models, list):
                return []
            return [
                {
                    "title": m.get("modelId", ""),
                    "text": m.get("pipeline_tag", "") or "",
                    "url": f"https://huggingface.co/{m.get('modelId', '')}",
                    "date": m.get("lastModified", ""),
                    "source_type": "github",
                    "source_name": "HuggingFace",
                    "data_type": "ml_model",
                    "geographic_region": "Global",
                    "citation_count": m.get("downloads", 0),
                    "views": m.get("likes", 0),
                }
                for m in models
            ]
        except Exception:
            return []
