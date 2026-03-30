/**
 * Fit assessment prompt with structured JSON output schema.
 */

export const FIT_ASSESSMENT_PROMPT = `You assess whether a product is likely to fit a shopper given structured signals.

Input (JSON):
{{PRODUCT_AND_CONTEXT_JSON}}

Task:
1) Summarize the strongest fit-relevant facts (max 5 bullets).
2) Estimate fit_alignment_score in [0,1] where 1 means high confidence of a good fit.
3) List positive_drivers and negative_drivers (machine keys, snake_case).
4) List uncertainty_reasons with severity: "blocking" | "material" | "informational".

Respond ONLY with valid JSON matching this schema:
{
  "summary_bullets": string[],
  "fit_alignment_score": number,
  "confidence_label": "very_high" | "high" | "medium" | "low" | "very_low",
  "positive_drivers": string[],
  "negative_drivers": string[],
  "uncertainty_reasons": Array<{
    "code": string,
    "severity": "blocking" | "material" | "informational",
    "message": string,
    "suggested_remediations": string[]
  }>,
  "category_specific_notes": string
}
`;

export function renderFitAssessmentPrompt(productAndContextJson: string): string {
  return FIT_ASSESSMENT_PROMPT.replace("{{PRODUCT_AND_CONTEXT_JSON}}", productAndContextJson);
}
