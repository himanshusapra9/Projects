from __future__ import annotations

import os
import time

_start_time = time.time()


def get_uptime() -> float:
    return round(time.time() - _start_time, 1)


def is_demo_mode() -> bool:
    return os.getenv("DEMO_MODE", "true").lower() == "true"


def get_anthropic_key() -> str | None:
    key = os.getenv("ANTHROPIC_API_KEY", "")
    if not key or key == "your_anthropic_api_key_here":
        return None
    return key


def is_claude_available() -> bool:
    return get_anthropic_key() is not None
