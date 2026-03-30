export const FOLLOWUP_HANDLING_PROMPT = `Handle a follow-up message within an ongoing shopping conversation. Determine whether this is a refinement, a new query, a comparison request, or feedback.

## Input
- New message: {message}
- Conversation history: {history}
- Current intent: {currentIntent}
- Current recommendations: {currentRecommendations}
- Session memory: {sessionMemory}

## Output JSON schema
{
  "turnType": "refinement|new_query|comparison|feedback|explanation_request",
  "intentUpdate": {
    "action": "refine|replace|expand",
    "changes": {
      "addedConstraints": [],
      "removedConstraints": [],
      "addedPreferences": [],
      "removedPreferences": [],
      "budgetChange": null,
      "categoryShift": null
    }
  },
  "referencedProducts": ["product IDs the user is referring to"],
  "rejectedProducts": [
    {
      "productId": "id",
      "reason": "why the user rejected this"
    }
  ],
  "newQuery": "if this is a completely new search, the parsed new query",
  "comparisonRequest": {
    "productIds": ["ids to compare"],
    "comparisonAttributes": ["what to compare on"]
  },
  "needsFullReRank": true/false,
  "needsNewRetrieval": true/false,
  "confidence": 0.0-1.0
}

## Rules
1. If the user says "something cheaper", it's a refinement with a budget constraint change.
2. If the user says "what about X brand instead", it's a refinement with a brand preference change.
3. If the user says "actually, I need a blender instead", it's a new query.
4. If the user references "the first one" or "option B", map to specific product IDs from current recommendations.
5. If the user says "why did you recommend X?", it's an explanation request.
6. "Compare these two" or "what's the difference between" is a comparison request.
7. Negative feedback like "too expensive" or "I don't like the style" should be extracted as rejected products with reasons.
8. Only set needsNewRetrieval if the category or core need changed significantly.
9. Only set needsFullReRank if constraints or preferences changed meaningfully.`;

export const FOLLOWUP_HANDLING_VERSION = '1.0.0';
