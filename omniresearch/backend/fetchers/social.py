from __future__ import annotations

from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


async def fetch_reddit(
    query: str, max_results: int = 20
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://www.reddit.com/search.json",
                params={
                    "q": query,
                    "sort": "relevance",
                    "limit": min(max_results, 25),
                },
                headers={"User-Agent": "OmniResearch/1.0"},
            )
            resp.raise_for_status()
            posts = resp.json().get("data", {}).get("children", [])
            return [
                {
                    "title": p["data"].get("title", ""),
                    "text": p["data"].get("selftext", "")[:2000],
                    "url": f"https://reddit.com{p['data'].get('permalink', '')}",
                    "date": "",
                    "source_type": "social",
                    "source_name": "Reddit",
                    "data_type": "forum_post",
                    "geographic_region": "Global",
                    "citation_count": 0,
                    "score": p["data"].get("score", 0),
                    "num_comments": p["data"].get("num_comments", 0),
                }
                for p in posts
            ]
        except Exception:
            return []


async def fetch_hackernews(
    query: str, max_results: int = 20
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://hn.algolia.com/api/v1/search",
                params={
                    "query": query,
                    "hitsPerPage": min(max_results, 30),
                },
            )
            resp.raise_for_status()
            hits = resp.json().get("hits", [])
            return [
                {
                    "title": h.get("title", "") or h.get("story_title", ""),
                    "text": h.get("comment_text", "")
                    or h.get("story_text", "")
                    or "",
                    "url": h.get("url", "")
                    or f"https://news.ycombinator.com/item?id={h.get('objectID', '')}",
                    "date": h.get("created_at", ""),
                    "source_type": "social",
                    "source_name": "Hacker News",
                    "data_type": "forum_post",
                    "geographic_region": "Global",
                    "citation_count": 0,
                    "score": h.get("points", 0) or 0,
                    "num_comments": h.get("num_comments", 0) or 0,
                }
                for h in hits
            ]
        except Exception:
            return []
