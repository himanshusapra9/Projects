/**
 * Reddit / community-style thread summarization for enrichment signals.
 */

export const COMMUNITY_FEEDBACK_SUMMARIZER_PROMPT = `You summarize community discussions (e.g., Reddit) about a product class or SKU.

Raw threads (JSON array of { source, title, excerpt, score }):
{{THREADS_JSON}}

Task:
- Extract consensus themes on fit (runs small/large, width), quality, and use-case fit.
- Mark contradictions and which side has stronger sourcing (higher score, more detailed).
- community_confidence in [0,1] reflects agreement and source quality, not product quality.

Respond ONLY as JSON:
{
  "consensus_themes": string[],
  "fit_bias": "runs_small" | "true_to_size" | "runs_large" | "mixed",
  "fit_bias_confidence": number,
  "quality_sentiment": "negative" | "mixed" | "positive",
  "contradictions": Array<{ "topic": string, "summary": string }>,
  "community_confidence": number,
  "caveats": string[]
}
`;

export function renderCommunityFeedbackSummarizerPrompt(threadsJson: string): string {
  return COMMUNITY_FEEDBACK_SUMMARIZER_PROMPT.replace("{{THREADS_JSON}}", threadsJson);
}
