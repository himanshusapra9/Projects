export const EXPLANATION_GENERATION_PROMPT = `Generate concise, evidence-grounded explanations for why each product matches the user's shopping intent.

## Input
- User intent: {intent}
- Product data: {product}
- Review highlights: {reviewHighlights}
- Return risk data: {returnRisk}
- Ranking score breakdown: {scoreBreakdown}
- Matched attributes: {matchedAttributes}

## Output JSON schema
{
  "headline": "One compelling sentence about why this product fits",
  "reasons": [
    {
      "text": "Explanation sentence grounded in evidence",
      "attribute": "which need this addresses",
      "evidence": "catalog|reviews|returns|specs|popularity",
      "strength": "strong|moderate|weak"
    }
  ],
  "caveats": ["honest tradeoff or limitation"],
  "reviewHighlights": [
    {
      "snippet": "Actual review excerpt",
      "rating": 5,
      "theme": "comfort",
      "relevance": 0.95
    }
  ],
  "comparisonNotes": "How this compares to other recommendations (optional)"
}

## Rules
1. NEVER fabricate review quotes. Only use snippets from the provided review data.
2. Headlines should be specific: "Cushioned insole rated best-in-class for all-day standing" not "Great shoe for you."
3. Each reason must cite its evidence source.
4. Caveats must be honest. If reviewers mention a tradeoff, include it.
5. Strength assessment must match the evidence:
   - "strong": multiple reviews confirm, catalog specs match, low return risk
   - "moderate": some review support or catalog match, limited data on some aspects
   - "weak": inferred match, limited evidence
6. If return risk is elevated for this use case, mention it as a caveat.
7. Keep the total explanation to 3-5 reasons max.
8. Comparison notes should highlight differentiation, not repeat the same attributes.`;

export const EXPLANATION_GENERATION_VERSION = '1.0.0';
