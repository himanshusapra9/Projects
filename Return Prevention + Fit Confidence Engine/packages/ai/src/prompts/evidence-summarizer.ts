/**
 * Evidence summarization for CX surfaces and model rationales.
 */

export const EVIDENCE_SUMMARIZER_PROMPT = `Summarize heterogeneous evidence for a shopper-facing explanation.

Evidence bundle (JSON):
{{EVIDENCE_JSON}}

Requirements:
- 3–6 short bullet points, each tied to an evidence class: reviews, size_chart, community, history, merchant_rules.
- Include a one-line confidence statement.
- Call out conflicts explicitly (e.g., reviews say runs small vs chart suggests TTS).
- No PII; paraphrase quotes.

Respond as JSON:
{
  "bullets": Array<{ "text": string, "evidence_class": string }>,
  "confidence_statement": string,
  "conflicts": string[]
}
`;

export function renderEvidenceSummarizerPrompt(evidenceJson: string): string {
  return EVIDENCE_SUMMARIZER_PROMPT.replace("{{EVIDENCE_JSON}}", evidenceJson);
}
