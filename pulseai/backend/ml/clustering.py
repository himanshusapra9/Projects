from __future__ import annotations
from typing import Optional
from backend.models.insight_card import InsightCard

def cluster_feedback_mock(feedback_items: list[dict], min_cluster_size: int = 5) -> list[InsightCard]:
    """Mock clustering for testing. Groups by first matched topic."""
    from collections import defaultdict
    
    groups: dict[str, list[dict]] = defaultdict(list)
    for item in feedback_items:
        topic = item.get("topics", ["general"])[0] if item.get("topics") else "general"
        groups[topic].append(item)
    
    cards = []
    for topic, items in groups.items():
        if len(items) < min_cluster_size:
            continue
        sentiments = [it.get("sentiment_score", 0.0) for it in items]
        avg_sentiment = sum(sentiments) / max(len(sentiments), 1)
        quotes = [it.get("text", "")[:100] for it in items[:3]]
        
        cards.append(InsightCard(
            id=f"card_{topic}",
            title=f"{topic.replace('_', ' ').title()} Feedback Cluster",
            signal_strength=min(100.0, len(items) * 10.0),
            trend_pct=0.0,
            sentiment_label="positive" if avg_sentiment > 0.3 else ("negative" if avg_sentiment < -0.3 else "neutral"),
            sentiment_avg=round(avg_sentiment, 2),
            source_summary=f"{len(items)} feedback items",
            sample_quotes=quotes,
            feedback_count=len(items),
            topic=topic,
        ))
    return cards
