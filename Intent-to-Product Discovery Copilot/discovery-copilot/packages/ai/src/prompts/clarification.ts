export const CLARIFICATION_PLANNING_PROMPT = `Given the parsed intent and available catalog data, determine whether clarifying questions are needed and generate them if so.

## Input
- Parsed intent: {intent}
- Catalog coverage summary: {catalogCoverage}
- Ambiguity factors: {ambiguityFactors}
- Confidence score: {confidence}
- Top candidate spread: {candidateSpread}
- Session turn count: {turnCount}
- User patience signal: {patienceSignal}

## Decision framework

Evaluate these factors (each scored 0-1):

| Factor                    | Weight | Description                                           |
|---------------------------|--------|-------------------------------------------------------|
| Ambiguity                 | 0.25   | How vague is the query?                               |
| Catalog breadth           | 0.15   | How many candidates span different sub-categories?    |
| Attribute sensitivity     | 0.20   | Could a wrong attribute choice cause a return?        |
| Consequence of mismatch   | 0.20   | How bad is it if the recommendation is wrong?         |
| Budget uncertainty        | 0.10   | Is the price range unclear?                           |
| Confidence spread         | 0.10   | How different are top-1 and top-5 scores?             |

CLARIFICATION_SCORE = weighted sum of factors

- If CLARIFICATION_SCORE < 0.3: Show results, no questions.
- If CLARIFICATION_SCORE 0.3-0.5: Show results + one refinement question.
- If CLARIFICATION_SCORE 0.5-0.7: Ask 1-2 questions, then show results.
- If CLARIFICATION_SCORE > 0.7: Ask 2-3 targeted questions first.

OVERRIDE RULES:
- If turnCount >= 2 and user hasn't seen any products yet, ALWAYS show results with optional refinement.
- If user shows impatience signals, reduce questions by 1.
- Never ask about attributes that won't change the top 3 results.

## Output JSON schema
{
  "shouldAsk": true/false,
  "score": 0.0-1.0,
  "factorScores": { "ambiguity": 0.0, "catalogBreadth": 0.0, ... },
  "strategy": "show_results|show_with_refinement|ask_then_show",
  "questions": [
    {
      "question": "human-readable question",
      "type": "single_choice|multiple_choice|free_text|range|yes_no",
      "options": [{"id": "opt1", "label": "Option label", "description": "optional context"}],
      "attribute": "which attribute this resolves",
      "priority": 1,
      "expectedImpact": 0.0-1.0,
      "reason": "why this question matters"
    }
  ]
}

## Rules for good clarifying questions
1. Be specific, not generic. "What size room?" is better than "Tell me more about what you need."
2. Provide options whenever possible — reduce cognitive load.
3. Questions should resolve the HIGHEST-IMPACT ambiguity first.
4. Frame questions around the user's use case, not product attributes.
5. Never ask obvious questions (don't ask "what's your budget?" if they said "under $80").
6. Each question should change the recommendation set meaningfully.`;

export const CLARIFICATION_PLANNING_VERSION = '1.0.0';
