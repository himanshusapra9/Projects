/**
 * Behavior tracking and learning types.
 * Multi-level learning: session, user, tenant, category, global.
 */

export interface BehaviorEvent {
  id: string;
  sessionId: string;
  userId?: string;
  tenantId: string;
  type: BehaviorEventType;
  timestamp: string;
  payload: BehaviorPayload;
  context: BehaviorContext;
}

export type BehaviorEventType =
  | 'impression'
  | 'click'
  | 'dwell'
  | 'add_to_cart'
  | 'save'
  | 'compare'
  | 'dismiss'
  | 'refinement_select'
  | 'clarification_response'
  | 'purchase'
  | 'return'
  | 'repeat_visit'
  | 'recommendation_accept'
  | 'recommendation_override'
  | 'filter_apply'
  | 'filter_remove'
  | 'chip_click'
  | 'explanation_expand'
  | 'feedback_positive'
  | 'feedback_negative';

export interface BehaviorPayload {
  productId?: string;
  productIds?: string[];
  query?: string;
  filterId?: string;
  chipId?: string;
  clarificationQuestionId?: string;
  clarificationAnswer?: string;
  dwellTimeMs?: number;
  position?: number;
  price?: number;
  brand?: string;
  category?: string;
  attributes?: Record<string, string>;
  overrideReason?: string;
  returnReason?: string;
}

export interface BehaviorContext {
  queryIntent?: string;
  decisionId?: string;
  recommendationPosition?: number;
  wasAiSuggested?: boolean;
  device: 'desktop' | 'mobile' | 'tablet';
  pageType: 'search' | 'landing' | 'product' | 'compare';
}

export interface SignalExtraction {
  userId: string;
  signals: ExtractedSignal[];
  extractedAt: string;
}

export interface ExtractedSignal {
  attribute: string;
  direction: 'positive' | 'negative' | 'neutral';
  strength: 'weak' | 'moderate' | 'strong';
  source: BehaviorEventType;
  value?: string;
  confidence: number;
  decayRate: number;
  examples: string[];
}

export interface UserPreferenceInference {
  userId: string;
  preferences: InferredUserPreference[];
  lastUpdated: string;
  totalEvents: number;
  confidenceLevel: 'low' | 'medium' | 'high';
}

export interface InferredUserPreference {
  attribute: string;
  preferredValues: string[];
  avoidedValues: string[];
  strength: number;
  confidence: number;
  evidenceCount: number;
  lastObserved: string;
  decayFactor: number;
  type: 'explicit' | 'inferred_strong' | 'inferred_weak' | 'temporary';
}

export interface AdaptiveRankingUpdate {
  userId: string;
  weightAdjustments: Record<string, number>;
  boostFactors: BoostFactor[];
  penaltyFactors: PenaltyFactor[];
  appliedAt: string;
}

export interface BoostFactor {
  attribute: string;
  value: string;
  boostMultiplier: number;
  reason: string;
}

export interface PenaltyFactor {
  attribute: string;
  value: string;
  penaltyMultiplier: number;
  reason: string;
}
