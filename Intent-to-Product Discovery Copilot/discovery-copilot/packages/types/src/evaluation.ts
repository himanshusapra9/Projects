export interface EvaluationDatasetEntry {
  id: string;
  query: string;
  category: string;
  expectedAttributes: Record<string, string>;
  relevantProductIds: string[];
  idealClarificationNeeded: boolean;
  idealClarificationAttribute?: string;
  idealExplanationContains: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface EvaluationResult {
  id: string;
  datasetEntryId: string;
  timestamp: string;
  metrics: OfflineMetrics;
  modelVersion: string;
  rankingVersion: string;
  notes?: string;
}

export interface OfflineMetrics {
  ndcg5: number;
  ndcg10: number;
  mrr: number;
  attributeMatchRate: number;
  clarificationPrecision: number;
  clarificationRecall: number;
  explanationGroundingRate: number;
  returnRiskCalibration: number;
  confidenceCalibration: number;
  diversityScore: number;
  redundancyScore: number;
  averageLatencyMs: number;
}

export interface OnlineMetrics {
  sessionId: string;
  ctr: number;
  addToCartRate: number;
  conversionRate: number;
  revenuePerSession: number;
  returnRate: number;
  conversationCompletionRate: number;
  clarificationAnswerRate: number;
  timeToFirstResultMs: number;
  totalTurns: number;
  satisfactionScore?: number;
  bounced: boolean;
}

export interface FeedbackEvent {
  id: string;
  sessionId: string;
  userId?: string;
  type: FeedbackEventType;
  productId?: string;
  recommendationSetId?: string;
  turnIndex: number;
  metadata: Record<string, string | number | boolean>;
  timestamp: string;
}

export type FeedbackEventType =
  | 'impression'
  | 'click'
  | 'add_to_cart'
  | 'purchase'
  | 'return'
  | 'thumbs_up'
  | 'thumbs_down'
  | 'clarification_answered'
  | 'clarification_skipped'
  | 'refinement_requested'
  | 'explanation_expanded'
  | 'comparison_opened'
  | 'session_abandoned'
  | 'session_completed';

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  trafficAllocation: Record<string, number>;
  primaryMetric: keyof OnlineMetrics;
  secondaryMetrics: (keyof OnlineMetrics)[];
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface ABTestVariant {
  id: string;
  name: string;
  config: Record<string, unknown>;
}

export interface HumanEvaluationRubric {
  dimensions: EvaluationDimension[];
  instructions: string;
  exampleAnnotations: AnnotationExample[];
}

export interface EvaluationDimension {
  name: string;
  description: string;
  scale: { min: number; max: number; labels: Record<number, string> };
  weight: number;
}

export interface AnnotationExample {
  query: string;
  response: string;
  scores: Record<string, number>;
  reasoning: string;
}
