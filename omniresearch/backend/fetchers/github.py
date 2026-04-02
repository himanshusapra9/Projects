from __future__ import annotations

from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


async def fetch_github_repos(
    query: str, token: str = "", max_results: int = 20
) -> list[dict[str, Any]]:
    headers: dict[str, str] = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://api.github.com/search/repositories",
                params={
                    "q": query,
                    "sort": "stars",
                    "per_page": min(max_results, 30),
                },
                headers=headers,
            )
            resp.raise_for_status()
            items = resp.json().get("items", [])
            return [
                {
                    "title": r.get("full_name", ""),
                    "text": r.get("description", "") or "",
                    "url": r.get("html_url", ""),
                    "date": r.get("updated_at", ""),
                    "source_type": "github",
                    "source_name": "GitHub",
                    "data_type": "repository",
                    "geographic_region": "Global",
                    "citation_count": r.get("stargazers_count", 0),
                    "score": r.get("forks_count", 0),
                }
                for r in items
            ]
        except Exception:
            return []
