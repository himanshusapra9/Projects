from __future__ import annotations

import json
from typing import Any

from config import settings


def plan_query(query: str, depth: str = "standard") -> dict[str, Any]:
    try:
        import anthropic

        client = anthropic.Anthropic(
            api_key=settings.anthropic_api_key or None,
            timeout=120.0,
        )
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=(
                "You decompose research queries into sub-queries targeting "
                "specific source types. Return ONLY valid JSON."
            ),
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Decompose this research query into 3-5 sub-queries:\n"
                        f"Query: {query}\nDepth: {depth}\n\n"
                        f'Return JSON: {{"sub_queries": [{{"query": "...", '
                        f'"target_sources": ["academic"|"web"|"video"|"social"|'
                        f'"news"|"github"], "priority": 1-5}}]}}'
                    ),
                }
            ],
        )
        text = response.content[0].text
        return json.loads(text)
    except Exception:
        return {
            "sub_queries": [
                {
                    "query": query,
                    "target_sources": ["academic", "web"],
                    "priority": 1,
                }
            ]
        }
