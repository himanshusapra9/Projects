from __future__ import annotations

from backend.models.feedback import FeedbackItem


def parse_intercom_webhook(payload: dict) -> FeedbackItem | None:
    data = payload.get("data", {}).get("item", {})
    body = data.get("body", "") or data.get("source", {}).get("body", "")
    if not body:
        return None
    return FeedbackItem(
        id=str(data.get("id", "")),
        text=body,
        source_platform="intercom",
        author_id=str(data.get("user", {}).get("id", "")),
        author_name=data.get("user", {}).get("name", ""),
        metadata={"type": data.get("type", ""), "tags": data.get("tags", [])},
    )


def parse_zendesk_webhook(payload: dict) -> FeedbackItem | None:
    ticket = payload.get("ticket", {})
    text = ticket.get("description", "") or ticket.get("subject", "")
    if not text:
        return None
    return FeedbackItem(
        id=str(ticket.get("id", "")),
        text=text,
        source_platform="zendesk",
        author_id=str(ticket.get("requester_id", "")),
        metadata={
            "priority": ticket.get("priority", ""),
            "status": ticket.get("status", ""),
        },
    )
