from __future__ import annotations

import asyncio
import os
import tempfile
from typing import Any

import httpx

from ml.transcription import get_whisper_model

HTTP_TIMEOUT: httpx.Timeout = httpx.Timeout(30.0)
AUDIO_DOWNLOAD_TIMEOUT: httpx.Timeout = httpx.Timeout(60.0)


async def fetch_podcasts(
    query: str, api_key: str, max_results: int = 5
) -> list[dict[str, Any]]:
    if not api_key:
        return []
    async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
        try:
            resp = await client.get(
                "https://listen-api.listennotes.com/api/v2/search",
                params={
                    "q": query,
                    "type": "episode",
                    "len_min": 5,
                    "sort_by_date": 0,
                    "safe_mode": 0,
                },
                headers={"X-ListenAPI-Key": api_key},
            )
            resp.raise_for_status()
            episodes = resp.json().get("results", [])[:max_results]
            transcribe_tasks = [
                _transcribe_episode(ep.get("audio", "") or "", client)
                for ep in episodes
            ]
            transcripts = await asyncio.gather(*transcribe_tasks)
            results: list[dict[str, Any]] = []
            for ep, transcript in zip(episodes, transcripts):
                results.append(
                    {
                        "title": ep.get("title_original", ""),
                        "text": ep.get("description_original", ""),
                        "transcript": transcript,
                        "podcast_name": ep.get("podcast", {}).get(
                            "title_original", ""
                        ),
                        "url": ep.get("listennotes_url", ""),
                        "date": str(ep.get("pub_date_ms", "")),
                        "duration": ep.get("audio_length_sec", 0),
                        "source_type": "audio",
                        "source_name": "Podcast",
                        "data_type": "podcast_transcript",
                        "geographic_region": "Global",
                        "citation_count": 0,
                    }
                )
            return results
        except Exception:
            return []


def _transcribe_episode_sync(content: bytes) -> str:
    model = get_whisper_model()
    if model is None:
        return ""
    try:
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            f.write(content)
            tmp_path = f.name
        result = model.transcribe(tmp_path)
        os.unlink(tmp_path)
        return str(result.get("text", ""))[:8000]
    except Exception:
        return ""


async def _transcribe_episode(
    audio_url: str, client: httpx.AsyncClient
) -> str:
    if not audio_url:
        return ""
    if get_whisper_model() is None:
        return ""
    try:
        resp = await client.get(
            audio_url, timeout=AUDIO_DOWNLOAD_TIMEOUT, follow_redirects=True
        )
        return await asyncio.to_thread(_transcribe_episode_sync, resp.content)
    except Exception:
        return ""
