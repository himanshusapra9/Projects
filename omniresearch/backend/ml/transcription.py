from __future__ import annotations

from functools import lru_cache
from typing import Any


@lru_cache(maxsize=1)
def get_whisper_model() -> Any:
    try:
        import whisper

        return whisper.load_model("base")
    except Exception:
        return None


def transcribe_audio(audio_path: str) -> str:
    model = get_whisper_model()
    if model is None:
        return ""
    try:
        result = model.transcribe(audio_path)
        return str(result.get("text", ""))[:8000]
    except Exception:
        return ""
