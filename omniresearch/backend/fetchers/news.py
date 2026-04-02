from __future__ import annotations

from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


async def fetch_news(
    query: str, api_key: str, max_results: int = 20
) -> list[dict[str, Any]]:
    if not api_key:
        return []
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": query,
                    "sortBy": "relevancy",
                    "pageSize": min(max_results, 50),
                    "language": "en",
                },
                headers={"X-Api-Key": api_key},
            )
            resp.raise_for_status()
            articles = resp.json().get("articles", [])
            return [
                {
                    "title": a.get("title", ""),
                    "text": a.get("description", "")
                    or a.get("content", "")
                    or "",
                    "url": a.get("url", ""),
                    "date": a.get("publishedAt", ""),
                    "source_type": "news",
                    "source_name": a.get("source", {}).get("name", "News"),
                    "data_type": "news_article",
                    "geographic_region": "Global",
                    "citation_count": 0,
                    "authors": [a.get("author", "")]
                    if a.get("author")
                    else [],
                }
                for a in articles
            ]
        except Exception:
            return []
