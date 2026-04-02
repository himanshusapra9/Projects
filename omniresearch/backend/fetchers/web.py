from __future__ import annotations

from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


async def fetch_brave_search(
    query: str, api_key: str, max_results: int = 20
) -> list[dict[str, Any]]:
    if not api_key:
        return []
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://api.search.brave.com/res/v1/web/search",
                params={"q": query, "count": min(max_results, 20)},
                headers={
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip",
                    "X-Subscription-Token": api_key,
                },
            )
            resp.raise_for_status()
            results = resp.json().get("web", {}).get("results", [])
            return [
                {
                    "title": r.get("title", ""),
                    "text": r.get("description", ""),
                    "url": r.get("url", ""),
                    "date": r.get("age", ""),
                    "source_type": "web",
                    "source_name": "Brave Search",
                    "data_type": "web_page",
                    "geographic_region": "Global",
                    "citation_count": 0,
                }
                for r in results
            ]
        except Exception:
            return []


async def fetch_tavily(
    query: str, api_key: str, max_results: int = 10
) -> list[dict[str, Any]]:
    if not api_key:
        return []
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": api_key,
                    "query": query,
                    "max_results": max_results,
                    "include_raw_content": False,
                },
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            return [
                {
                    "title": r.get("title", ""),
                    "text": r.get("content", ""),
                    "url": r.get("url", ""),
                    "date": "",
                    "source_type": "web",
                    "source_name": "Tavily",
                    "data_type": "web_page",
                    "geographic_region": "Global",
                    "citation_count": 0,
                    "relevance_score": r.get("score", 0.0),
                }
                for r in results
            ]
        except Exception:
            return []


async def fetch_wikipedia(
    query: str, max_results: int = 5
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://en.wikipedia.org/w/api.php",
                params={
                    "action": "query",
                    "list": "search",
                    "srsearch": query,
                    "srlimit": max_results,
                    "format": "json",
                },
            )
            resp.raise_for_status()
            results = resp.json().get("query", {}).get("search", [])
            return [
                {
                    "title": r.get("title", ""),
                    "text": r.get("snippet", "")
                    .replace('<span class="searchmatch">', "")
                    .replace("</span>", ""),
                    "url": f"https://en.wikipedia.org/wiki/{r.get('title', '').replace(' ', '_')}",
                    "date": r.get("timestamp", ""),
                    "source_type": "web",
                    "source_name": "Wikipedia",
                    "data_type": "encyclopedia",
                    "geographic_region": "Global",
                    "citation_count": 0,
                }
                for r in results
            ]
        except Exception:
            return []
