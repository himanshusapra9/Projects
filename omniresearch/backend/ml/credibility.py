from __future__ import annotations

import math
from typing import Any


def score_credibility(document: dict[str, Any]) -> float:
    source_type = str(document.get("source_type", "web"))
    citation_count = int(document.get("citation_count", 0) or 0)
    score = int(document.get("score", 0) or 0)
    views = int(document.get("views", 0) or 0)

    if source_type == "academic":
        return min(1.0, math.log(citation_count + 1) / 10)
    elif source_type in ("social", "reddit", "hackernews"):
        return min(
            1.0,
            (score + int(document.get("num_comments", 0) or 0)) / 1000,
        )
    elif source_type == "video":
        return min(1.0, math.log(views + 1) / 15)
    elif source_type == "news":
        return 0.6
    elif source_type == "audio":
        return 0.5
    else:
        return 0.4
