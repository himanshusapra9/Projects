from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

router = APIRouter()

_SAMPLE_INSIGHT: dict[str, Any] = {
    "id": "sample",
    "text": "Sample insight",
    "source_type": "web",
    "source_name": "Test",
    "url": "",
    "date": "",
    "author": "",
    "geographic_region": "Global",
    "data_type": "text",
    "credibility_score": 0.5,
    "sentiment_label": "neutral",
    "sentiment_score": 0.0,
    "relevance_score": 0.5,
    "citation_count": 0,
    "report_section": "",
    "research_depth": "standard",
    "sub_query_matched": "",
}


@router.get("/research/{task_id}/export/{format}", tags=["export"])
async def export_research(task_id: str, format: str) -> Response:
    if format not in ("csv", "pdf", "json", "markdown"):
        raise HTTPException(
            status_code=400, detail=f"Unsupported format: {format}"
        )
    from agents.export_generator import (
        generate_csv,
        generate_json_export,
        generate_markdown,
        generate_pdf,
    )

    sample_insights = [_SAMPLE_INSIGHT.copy()]
    if format == "csv":
        data = generate_csv(sample_insights)
        return Response(
            content=data,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=research_{task_id}.csv"
            },
        )
    if format == "pdf":
        data = generate_pdf("Sample report", "Sample query")
        return Response(
            content=data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=research_{task_id}.pdf"
            },
        )
    if format == "json":
        data = generate_json_export("Sample synthesis", "Sample query", sample_insights)
        return Response(content=data, media_type="application/json")
    data = generate_markdown("Sample synthesis", "Sample query")
    return Response(content=data, media_type="text/markdown")
