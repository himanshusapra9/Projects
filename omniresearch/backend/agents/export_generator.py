from __future__ import annotations

import io
import json
from datetime import datetime, timezone
from typing import Any, Optional

import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def generate_exports(
    synthesis: str, query: str, documents: list[dict[str, Any]]
) -> dict[str, Any]:
    insights = _build_insights(documents)
    return {
        "csv": True,
        "pdf": True,
        "json": True,
        "markdown": True,
        "synthesis": synthesis,
        "insights_count": len(insights),
    }


def generate_csv(insights: list[dict[str, Any]]) -> bytes:
    df = pd.DataFrame(
        [
            {
                "insight_id": ins.get("id", ""),
                "insight_text": ins.get("text", ""),
                "source_type": ins.get("source_type", ""),
                "source_name": ins.get("source_name", ""),
                "source_url": ins.get("url", ""),
                "source_date": ins.get("date", ""),
                "author": ins.get("author", ""),
                "geographic_region": ins.get("geographic_region", "Global"),
                "data_type": ins.get("data_type", ""),
                "credibility_score": ins.get("credibility_score", 0),
                "sentiment_label": ins.get("sentiment_label", ""),
                "sentiment_score": ins.get("sentiment_score", 0),
                "relevance_score": ins.get("relevance_score", 0),
                "citation_count": ins.get("citation_count", 0),
                "report_section": ins.get("report_section", ""),
                "query_timestamp": datetime.now(timezone.utc).isoformat(),
                "research_depth": ins.get("research_depth", "standard"),
                "sub_query_matched": ins.get("sub_query_matched", ""),
            }
            for ins in insights
        ]
    )
    return df.to_csv(index=False).encode("utf-8")


def generate_pdf(
    report_text: str, query: str, metadata: Optional[dict[str, Any]] = None
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("OmniResearch Report", styles["Title"]),
        Paragraph(f"Query: {query}", styles["Heading2"]),
        Paragraph(
            f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            styles["Normal"],
        ),
        Spacer(1, 20),
        Paragraph(report_text.replace("\n", "<br/>"), styles["Normal"]),
    ]
    doc.build(story)
    return buffer.getvalue()


def generate_json_export(
    synthesis: str, query: str, insights: list[dict[str, Any]]
) -> bytes:
    data = {
        "query": query,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "synthesis": synthesis,
        "insights": insights,
    }
    return json.dumps(data, indent=2).encode("utf-8")


def generate_markdown(synthesis: str, query: str) -> bytes:
    md = (
        f"# OmniResearch Report\n\n**Query:** {query}\n\n"
        f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n\n"
        f"---\n\n{synthesis}"
    )
    return md.encode("utf-8")


def _build_insights(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "id": f"ins_{i:04d}",
            "text": str(
                d.get("text", d.get("abstract", d.get("transcript", "")))
            )[:500],
            "source_type": d.get("source_type", ""),
            "source_name": d.get("source_name", ""),
            "url": d.get("url", ""),
            "date": d.get("date", ""),
            "author": ", ".join(d.get("authors", []))
            if d.get("authors")
            else "",
            "geographic_region": d.get("geographic_region", "Global"),
            "data_type": d.get("data_type", ""),
            "credibility_score": d.get("credibility_score", 0),
            "sentiment_label": d.get("sentiment_label", "neutral"),
            "sentiment_score": d.get("sentiment_score", 0),
            "relevance_score": d.get("relevance_score", 0),
            "citation_count": d.get("citation_count", 0),
            "report_section": "",
            "research_depth": "standard",
            "sub_query_matched": "",
        }
        for i, d in enumerate(documents)
    ]
