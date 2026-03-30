export const INTENT_EXTRACTION_PROMPT = `Analyze the following shopping query and extract structured intent. Be precise and conservative — only extract what is clearly stated or strongly implied.

## Input
- User query: {query}
- Conversation history: {history}
- User preferences (from memory): {memory}

## Output JSON schema
{
  "primaryNeed": "one-sentence description of what the user is looking for",
  "useCases": ["specific use case 1", "specific use case 2"],
  "constraints": [
    {
      "type": "budget|size|color|material|brand|availability|shipping|custom",
      "attribute": "attribute name",
      "operator": "eq|lt|gt|lte|gte|in|not_in|contains",
      "value": "constraint value",
      "isHard": true/false
    }
  ],
  "preferences": [
    {
      "attribute": "attribute name",
      "direction": "prefer_high|prefer_low|prefer_value",
      "value": "optional specific value",
      "weight": 0.0-1.0
    }
  ],
  "recipient": {
    "relationship": "self|partner|parent|child|friend|colleague",
    "ageRange": "optional",
    "gender": "optional",
    "interests": ["optional"],
    "personality": ["optional"]
  },
  "urgency": "low|medium|high",
  "priceRange": { "min": null, "max": null },
  "categoryHints": ["likely category 1", "likely category 2"],
  "attributeRequirements": {
    "attribute_name": "required value or description"
  },
  "negativeConstraints": ["things the user does NOT want"],
  "confidence": 0.0-1.0,
  "ambiguityFactors": ["what makes this query ambiguous"]
}

## Rules
1. If the user says "under $80", set a hard budget constraint with max=80.
2. If the user mentions a use case like "for travel" or "for standing all day", extract it as both a useCase and relevant attributeRequirements.
3. Subjective terms like "comfortable", "durable", "minimalist" go into attributeRequirements with descriptive values.
4. If buying for someone else, populate the recipient field.
5. If the query is a follow-up, merge with conversation history to build complete intent.
6. Set confidence based on how specific the query is. "Shoes" = 0.2, "Nike Air Max 270 size 10" = 0.95.
7. List ambiguity factors honestly — these drive clarification question decisions.
8. Never hallucinate constraints the user didn't express.`;

export const INTENT_EXTRACTION_VERSION = '1.0.0';
