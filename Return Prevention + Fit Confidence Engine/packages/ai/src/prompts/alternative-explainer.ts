/**
 * Explanation text for why an alternative SKU was ranked highly.
 */

export const ALTERNATIVE_EXPLAINER_PROMPT = `Explain why a substitute product may reduce return risk or improve fit vs the current PDP item.

Context JSON:
{{ALT_CONTEXT_JSON}}

Constraints:
- Two sentences max for shopper UI; neutral tone.
- Mention at most one fit advantage and one risk reduction.
- If price is worse, acknowledge trade-off briefly.

Respond as JSON:
{
  "headline": string,
  "body": string,
  "fit_advantage": string | null,
  "risk_reduction": string | null,
  "trade_offs": string | null
}
`;

export function renderAlternativeExplainerPrompt(altContextJson: string): string {
  return ALTERNATIVE_EXPLAINER_PROMPT.replace("{{ALT_CONTEXT_JSON}}", altContextJson);
}
