from __future__ import annotations

from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


async def fetch_kaggle_datasets(
    query: str, max_results: int = 10
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://www.kaggle.com/api/v1/datasets/list",
                params={"search": query, "maxSize": max_results},
                headers={"User-Agent": "OmniResearch/1.0"},
            )
            if resp.status_code != 200:
                return []
            datasets = resp.json()
            if not isinstance(datasets, list):
                return []
            return [
                {
                    "title": d.get("title", ""),
                    "text": d.get("subtitle", "") or "",
                    "url": f"https://www.kaggle.com/datasets/{d.get('ref', '')}",
                    "date": d.get("lastUpdated", ""),
                    "source_type": "datasets",
                    "source_name": "Kaggle",
                    "data_type": "dataset",
                    "geographic_region": "Global",
                    "citation_count": d.get("downloadCount", 0),
                    "views": d.get("viewCount", 0),
                }
                for d in datasets[:max_results]
            ]
        except Exception:
            return []
