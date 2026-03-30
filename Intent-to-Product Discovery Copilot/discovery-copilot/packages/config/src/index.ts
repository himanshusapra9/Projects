export const RANKING_DEFAULTS = {
  maxCandidates: 50,
  maxResults: 5,
  diversityMaxSameBrand: 2,
  diversityMaxSameSubcategory: 3,
  budgetOverageThreshold: 0.1,
  minConfidenceToShow: 0.15,
  coldStartNewProductBoostDays: 30,
} as const;

export const CLARIFICATION_DEFAULTS = {
  maxQuestions: 3,
  minImpactThreshold: 0.3,
  ambiguityThresholdToAsk: 0.5,
  maxTurnsBeforeForceShow: 2,
} as const;

export const SESSION_DEFAULTS = {
  ttlMinutes: 30,
  maxTurns: 20,
  maxHistoryForContext: 6,
} as const;

export const MEMORY_DEFAULTS = {
  minConfidenceToStore: 0.5,
  maxLearnedPreferences: 50,
  maxSessionSummaries: 100,
  decayFactor: 0.95,
} as const;

export const MODEL_DEFAULTS = {
  intentParsing: { model: 'gpt-4o-mini', temperature: 0.1, maxTokens: 1500 },
  clarificationPlanning: { model: 'gpt-4o-mini', temperature: 0.3, maxTokens: 1000 },
  explanationGeneration: { model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 600 },
  memorySummarization: { model: 'gpt-4o-mini', temperature: 0.1, maxTokens: 800 },
  followUpHandling: { model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 1000 },
  embedding: { model: 'text-embedding-3-small', dimensions: 1536 },
} as const;
