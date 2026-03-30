/**
 * Return risk assessment prompt with structured output.
 */

export const RETURN_RISK_ASSESSMENT_PROMPT = `You estimate return likelihood and drivers before purchase.

Input (JSON):
{{RISK_CONTEXT_JSON}}

Task:
1) Integrate user history hints, product fragility, and review negativity carefully.
2) return_probability is P(return within policy window), calibrated roughly to [0,1].
3) Decompose contributions across these keys (weights sum to ~1): 
   size_mismatch, color_expectation, quality_perception, use_case_mismatch, logistics_damage,
   value_price_gap, impulse_purchase, data_sparsity (add other keys only if mass < 0.05 each).
4) Flag is_preventable_primary if the dominant driver is addressable pre-purchase (sizing, education, imagery).

Respond ONLY with valid JSON:
{
  "return_probability": number,
  "risk_tier": "negligible" | "low" | "moderate" | "elevated" | "high" | "critical",
  "top_drivers": Array<{ "key": string, "weight": number }>,
  "is_preventable_primary": boolean,
  "intervention_hooks": string[],
  "notes": string
}
`;

export function renderReturnRiskAssessmentPrompt(riskContextJson: string): string {
  return RETURN_RISK_ASSESSMENT_PROMPT.replace("{{RISK_CONTEXT_JSON}}", riskContextJson);
}
