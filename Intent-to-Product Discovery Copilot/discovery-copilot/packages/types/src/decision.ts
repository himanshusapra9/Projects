import type { RankedCandidate, ConfidenceScore } from './recommendation';
import type { ClarificationQuestion, ParsedIntent } from './session';

/**
 * The core output shape of the decision engine.
 * This is NOT a search result list — it's a decision with a recommendation.
 */
export interface DecisionResponse {
  id: string;
  sessionId: string;
  query: string;
  decision: Decision;
  confidence: ConfidenceScore;
  parsedIntent: ParsedIntent;
  clarification?: ClarificationQuestion[];
  suggestedRefinements: string[];
  metadata: DecisionMetadata;
}

export interface Decision {
  bestPick: RecommendationCard;
  alternatives: RecommendationCard[];
  rationale: string;
  tradeoffSummary: string;
  missingInformation: string[];
  coverageNote?: string;
}

export interface RecommendationCard {
  productId: string;
  productName: string;
  brand: string;
  price: { amount: number; currency: string; original?: number };
  imageUrl?: string;
  rating?: { average: number; count: number };
  headline: string;
  reasons: ReasonPoint[];
  tradeoffs: TradeoffPoint[];
  badges: Badge[];
  returnRisk: ReturnRiskIndicator;
  matchScore: number;
  evidence: EvidenceReference[];
}

export interface ReasonPoint {
  text: string;
  source: 'catalog' | 'reviews' | 'specs' | 'returns' | 'popularity';
  strength: 'strong' | 'moderate' | 'inferred';
}

export interface TradeoffPoint {
  text: string;
  severity: 'minor' | 'notable' | 'significant';
  attribute: string;
}

export interface Badge {
  type: BadgeType;
  label: string;
  tooltip: string;
}

export type BadgeType =
  | 'best_pick'
  | 'best_value'
  | 'low_return_risk'
  | 'top_rated'
  | 'great_for_usecase'
  | 'budget_friendly'
  | 'premium_choice'
  | 'most_popular'
  | 'editor_pick'
  | 'easy_to_clean'
  | 'quiet'
  | 'good_for_travel'
  | 'durable'
  | 'lightweight'
  | 'eco_friendly';

export interface ReturnRiskIndicator {
  level: 'low' | 'moderate' | 'elevated';
  percentage: number;
  note?: string;
}

export interface EvidenceReference {
  type: 'review_snippet' | 'spec_match' | 'return_stat' | 'rating';
  text: string;
  source: string;
  confidence: number;
}

export interface DecisionMetadata {
  latencyMs: number;
  modelUsed: string;
  tokensUsed: number;
  candidatesEvaluated: number;
  retrievalStrategy: string;
  rankingVersion: string;
  experimentVariant?: string;
  tenantId: string;
}
