export const MEMORY_SUMMARIZATION_PROMPT = `Summarize the current shopping session into long-term memory updates. Extract durable preferences and useful context for future sessions.

## Input
- Session transcript: {transcript}
- Current long-term memory: {currentMemory}
- Session outcome: {outcome}
- Products interacted with: {interactions}

## Output JSON schema
{
  "preferencesToUpdate": [
    {
      "attribute": "preference attribute",
      "value": "preferred value",
      "confidence": 0.0-1.0,
      "source": "explicit|inferred_purchase|inferred_browse|inferred_return",
      "reasoning": "why this preference was extracted"
    }
  ],
  "preferencesToRemove": [
    {
      "attribute": "attribute to remove",
      "reason": "why it's no longer valid"
    }
  ],
  "sessionSummary": {
    "query": "what the user was looking for",
    "outcome": "purchased|abandoned|bookmarked|comparison",
    "purchasedProductId": "optional",
    "satisfaction": 0-5,
    "keyPreferences": { "attribute": "value" }
  },
  "brandAffinityUpdates": [
    {
      "brand": "brand name",
      "delta": -1.0 to 1.0,
      "reason": "why affinity changed"
    }
  ]
}

## Rules
1. Only extract preferences with confidence >= 0.5.
2. Explicit statements ("I prefer leather") get confidence 0.9+.
3. Purchase behavior implies preference with confidence 0.7.
4. Browsing without purchase implies mild interest with confidence 0.4 — don't store these.
5. Returns override purchase-based preferences.
6. If a user explicitly says they dislike something, store it with high confidence.
7. Don't over-personalize: one-time gift shopping shouldn't update permanent preferences.
8. When in doubt, don't update. False preferences are worse than missing ones.
9. Summarize the session for future context — be concise but capture the essential intent.`;

export const MEMORY_SUMMARIZATION_VERSION = '1.0.0';
