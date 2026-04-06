from __future__ import annotations

from datetime import date

from backend.models.insight_card import InsightCard


def generate_daily_briefing_mock(
    insight_cards: list[InsightCard],
    date_str: str | None = None,
) -> str:
    if date_str is None:
        date_str = date.today().isoformat()

    top_cards = sorted(insight_cards, key=lambda c: c.signal_strength, reverse=True)[:8]

    lines = [f"# Daily Briefing — {date_str}\n"]
    lines.append("## Top Signals\n")
    for i, card in enumerate(top_cards[:3], 1):
        lines.append(
            f"{i}. **{card.title}** (strength: {card.signal_strength:.0f}/100, "
            f"sentiment: {card.sentiment_label})\n"
            f"   - {card.feedback_count} feedback items\n"
        )
        if card.sample_quotes:
            lines.append(f'   - Quote: "{card.sample_quotes[0]}"\n')

    lines.append("\n## Emerging Trends\n")
    for card in top_cards[3:6]:
        lines.append(f"- {card.title}: {card.feedback_count} signals\n")

    lines.append("\n## Recommendation\n")
    if top_cards:
        lines.append(f"Focus on **{top_cards[0].title}** — highest signal strength.\n")

    return "".join(lines)
