from __future__ import annotations

from functools import lru_cache
from typing import Any
from urllib.parse import urlparse

from config import settings


@lru_cache(maxsize=1)
def get_chromadb_client() -> Any:
    try:
        import chromadb

        parsed = urlparse(settings.chromadb_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or (8000 if parsed.scheme in ("http", "https") else 8000)
        if parsed.scheme in ("http", "https"):
            return chromadb.HttpClient(host=host, port=port)
    except Exception:
        pass
    import chromadb

    return chromadb.Client()


def get_or_create_collection(name: str = "research_documents") -> Any:
    client = get_chromadb_client()
    return client.get_or_create_collection(name=name)
