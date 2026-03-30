export interface RankingFeatures {
  productId: string;
  lexicalRelevance: number;
  semanticRelevance: number;
  taxonomyFit: number;
  useCaseFit: number;
  reviewSentiment: number;
  reviewVolume: number;
  returnRisk: number;
  priceFit: number;
  brandAffinity: number;
  availability: number;
  popularity: number;
  conversionPrior: number;
  recency: number;
  diversityPenalty: number;
  noveltyBonus: number;
  businessRuleBoost: number;
}

export interface RankingWeights {
  lexicalRelevance: number;
  semanticRelevance: number;
  taxonomyFit: number;
  useCaseFit: number;
  reviewSentiment: number;
  reviewVolume: number;
  returnRisk: number;
  priceFit: number;
  brandAffinity: number;
  availability: number;
  popularity: number;
  conversionPrior: number;
  recency: number;
  diversityPenalty: number;
  noveltyBonus: number;
  businessRuleBoost: number;
}

export interface RankingConfig {
  weights: RankingWeights;
  hardFilters: HardFilter[];
  softPreferences: SoftPreference[];
  diversityConstraints: DiversityConstraints;
  budgetHandling: BudgetConfig;
  coldStartStrategy: ColdStartConfig;
}

export interface HardFilter {
  attribute: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: string | number | string[];
  reason: string;
}

export interface SoftPreference {
  attribute: string;
  preferredValue: string | number;
  weight: number;
  fallbackBehavior: 'ignore' | 'penalize_slightly' | 'penalize_heavily';
}

export interface DiversityConstraints {
  maxSameBrand: number;
  maxSameSubcategory: number;
  minPriceSpread: number;
  requireDifferentStyles: boolean;
  diversityWeight: number;
}

export interface BudgetConfig {
  strictMode: boolean;
  overBudgetPenalty: number;
  underBudgetThreshold: number;
  showOverBudgetIfExceptional: boolean;
  overBudgetMaxPercent: number;
}

export interface ColdStartConfig {
  missingReviewStrategy: 'use_category_avg' | 'penalize_slightly' | 'neutral';
  missingReturnDataStrategy: 'use_category_avg' | 'neutral';
  newProductBoost: number;
  newProductBoostDays: number;
}
