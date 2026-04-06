from __future__ import annotations

from collections import defaultdict

from backend.models.feedback import ProcessedFeedback
from backend.models.insight_card import InsightCard


def build_insight_cards(
    processed_items: list[ProcessedFeedback],
    min_cluster_size: int = 3,
) -> list[InsightCard]:
    groups: dict[str, list[ProcessedFeedback]] = defaultdict(list)
    for item in processed_items:
        for topic in item.topics:
            groups[topic].append(item)

    cards = []
    for topic, items in groups.items():
        if len(items) < min_cluster_size:
            continue
        sentiments = [it.sentiment_score for it in items]
        avg_sent = sum(sentiments) / max(len(sentiments), 1)
        quotes = [it.original.text[:100] for it in items[:3]]

        if avg_sent > 0.3:
            label = "positive"
        elif avg_sent < -0.3:
            label = "negative"
        else:
            label = "neutral"

        cards.append(
            InsightCard(
                id=f"card_{topic}_{len(items)}",
                title=f"{topic.replace('_', ' ').title()} Signal",
                signal_strength=min(100.0, len(items) * 8.0),
                trend_pct=0.0,
                sentiment_label=label,
                sentiment_avg=round(avg_sent, 2),
                source_summary=f"{len(items)} items from feedback",
                sample_quotes=quotes,
                feedback_count=len(items),
                topic=topic,
            )
        )

    return sorted(cards, key=lambda c: c.signal_strength, reverse=True)
