from __future__ import annotations

import asyncio
from typing import Any

import httpx

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)


def _get_transcript_sync(video_id: str) -> str:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi

        t = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
        chunks = [f"[{int(e['start'])}s] {e['text']}" for e in t]
        return " ".join(chunks)[:8000]
    except Exception:
        return ""


async def fetch_youtube(
    query: str, api_key: str, max_results: int = 20
) -> list[dict[str, Any]]:
    if not api_key:
        return []
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            search_resp = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "maxResults": min(max_results, 20),
                    "order": "relevance",
                    "videoDuration": "medium",
                    "key": api_key,
                },
            )
            search_resp.raise_for_status()
            items = search_resp.json().get("items", [])
            results: list[dict[str, Any]] = []
            for item in items:
                video_id = item.get("id", {}).get("videoId", "")
                snippet = item.get("snippet", {})
                transcript_text = await asyncio.to_thread(
                    _get_transcript_sync, video_id
                )
                results.append(
                    {
                        "title": snippet.get("title", ""),
                        "text": snippet.get("description", ""),
                        "transcript": transcript_text,
                        "channel": snippet.get("channelTitle", ""),
                        "url": f"https://youtube.com/watch?v={video_id}",
                        "date": snippet.get("publishedAt", ""),
                        "source_type": "video",
                        "source_name": "YouTube",
                        "data_type": "video_transcript",
                        "geographic_region": "Global",
                        "citation_count": 0,
                        "views": 0,
                    }
                )
            return results
        except Exception:
            return []
