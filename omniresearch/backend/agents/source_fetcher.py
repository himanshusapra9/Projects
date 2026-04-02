from __future__ import annotations

import asyncio
from collections.abc import Coroutine
from typing import Any, Optional

from config import settings


async def fetch_all_sources(
    plan: dict[str, Any], source_filter: Optional[list[str]] = None
) -> list[dict[str, Any]]:
    sub_queries = plan.get("sub_queries", [])
    if not sub_queries:
        return []

    coros: list[Coroutine[Any, Any, list[dict[str, Any]]]] = []
    for sq in sub_queries:
        query = str(sq.get("query", ""))
        targets = sq.get("target_sources", ["web"])
        if isinstance(targets, list):
            target_list = [str(t) for t in targets]
        else:
            target_list = ["web"]
        if source_filter:
            target_list = [t for t in target_list if t in source_filter]

        for source in target_list:
            coros.append(_fetch_source(query, source))

    if not coros:
        return []

    results = await asyncio.gather(*coros, return_exceptions=True)
    documents: list[dict[str, Any]] = []
    for result in results:
        if isinstance(result, list):
            documents.extend(result)
    return documents


async def _fetch_source(
    query: str, source_type: str
) -> list[dict[str, Any]]:
    try:
        if source_type == "academic":
            from fetchers.academic import (
                fetch_arxiv,
                fetch_openalex,
                fetch_pubmed,
                fetch_semantic_scholar,
            )

            results = await asyncio.gather(
                fetch_openalex(query),
                fetch_semantic_scholar(query),
                fetch_arxiv(query),
                fetch_pubmed(query),
                return_exceptions=True,
            )
            docs: list[dict[str, Any]] = []
            for r in results:
                if isinstance(r, list):
                    docs.extend(r)
            return docs
        if source_type == "web":
            from fetchers.web import fetch_brave_search, fetch_wikipedia

            results = await asyncio.gather(
                fetch_brave_search(query, settings.brave_search_api_key),
                fetch_wikipedia(query),
                return_exceptions=True,
            )
            docs = []
            for r in results:
                if isinstance(r, list):
                    docs.extend(r)
            return docs
        if source_type == "video":
            from fetchers.video import fetch_youtube

            return await fetch_youtube(query, settings.youtube_data_api_key)
        if source_type == "social":
            from fetchers.social import fetch_hackernews, fetch_reddit

            results = await asyncio.gather(
                fetch_reddit(query),
                fetch_hackernews(query),
                return_exceptions=True,
            )
            docs = []
            for r in results:
                if isinstance(r, list):
                    docs.extend(r)
            return docs
        if source_type == "news":
            from fetchers.news import fetch_news

            return await fetch_news(query, settings.news_api_key)
        if source_type == "github":
            from fetchers.github import fetch_github_repos

            return await fetch_github_repos(query, settings.github_token)
        if source_type == "audio":
            from fetchers.audio import fetch_podcasts

            return await fetch_podcasts(query, settings.listen_notes_api_key)
        if source_type == "datasets":
            from fetchers.datasets import fetch_kaggle_datasets

            return await fetch_kaggle_datasets(query)
        return []
    except Exception:
        return []
