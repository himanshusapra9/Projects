from __future__ import annotations

from collections.abc import Generator
from typing import Any

import anthropic

from config import settings
from models.report import SynthesisInput


def synthesize(query: str, documents: list[dict[str, Any]]) -> str:
    chunks: list[str] = []
    for text in synthesize_streaming(
        SynthesisInput(query=query, documents=documents)
    ):
        chunks.append(text)
    return "".join(chunks)


def synthesize_streaming(
    input_data: SynthesisInput,
) -> Generator[str, None, None]:
    try:
        client = anthropic.Anthropic(
            api_key=settings.anthropic_api_key or None,
            timeout=600.0,
        )

        docs_formatted = "\n\n".join(
            [
                f"[Source {i + 1} | {d.get('source_type', 'unknown').upper()} | "
                f"{d.get('source_name', '')} | "
                f"credibility: {float(d.get('credibility_score', 0) or 0):.2f}]\n"
                f"Date: {d.get('date', 'unknown')}\n"
                f"Text: {str(d.get('text', d.get('abstract', d.get('transcript', ''))))[:1000]}"
                for i, d in enumerate(input_data.documents[:20])
            ]
        )

        prompt = f"""RESEARCH QUERY: {input_data.query}

SOURCE DOCUMENTS (ranked by relevance and credibility):
{docs_formatted}

Generate a comprehensive research report with these sections:
1. EXECUTIVE SUMMARY (200 words max)
2. KEY FINDINGS (bullet points with inline [Source N] citations)
3. SENTIMENT ANALYSIS (overall + breakdown by source type)
4. CONTRADICTIONS & DEBATES (where sources disagree)
5. KNOWLEDGE GAPS (what is unknown or under-researched)
6. TIMELINE OF DEVELOPMENTS (chronological key events)
7. RECOMMENDATIONS & IMPLICATIONS
8. SOURCE QUALITY ASSESSMENT

Rules:
- NEVER fabricate citations. Every factual claim must cite [Source N].
- If sources conflict, present both views with their respective citations.
- Be precise about uncertainty."""

        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            system=(
                "You are a world-class research analyst. Synthesize complex "
                "multi-source information into clear, accurate, well-structured "
                "insights. Never fabricate data. Always cite sources inline."
            ),
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            for text in stream.text_stream:
                yield text
    except Exception as e:
        yield f"Error generating synthesis: {str(e)}"
