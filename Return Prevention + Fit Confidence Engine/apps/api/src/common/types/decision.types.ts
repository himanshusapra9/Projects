export type RecommendedAction =
  | 'BUY'
  | 'CLARIFY'
  | 'REFINE'
  | 'COMPARE'
  | 'CONSIDER_ALTERNATIVE';

export interface EvidenceRef {
  source: 'MERCHANT' | 'REVIEW' | 'RETURN_STATS' | 'BEHAVIOR' | 'COMMUNITY' | 'MODEL';
  id: string;
  snippet?: string;
  weight: number;
}

export interface ClarificationQuestion {
  id: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'MEASUREMENT' | 'TEXT' | 'BOOLEAN';
  options?: Array<{ id: string; label: string; value: unknown }>;
  required: boolean;
  mapsToFeatureKeys: string[];
}

export interface DecisionResponse {
  schemaVersion: '1.0.0';
  requestId: string;
  tenantId: string;
  productId: string;
  resolvedVariantIds: string[];
  recommendedVariantIds: string[];
  recommendedAction: RecommendedAction;
  fitConfidence: number;
  returnRisk: number;
  uncertainty: {
    epistemic: number;
    aleatoric: number;
    total: number;
  };
  clarification?: {
    maxQuestions: number;
    questions: ClarificationQuestion[];
    reasonCodes: string[];
  };
  alternatives: Array<{
    productId: string;
    variantId?: string;
    score: number;
    tradeoffs: string[];
    saferOnDimensions?: string[];
  }>;
  explanation: {
    summary: string;
    bullets: Array<{ text: string; featureIds?: string[] }>;
    citations: EvidenceRef[];
  };
  refinement?: {
    suggestedFilters: Array<{ key: string; value: unknown; rationale: string }>;
    chips: Array<{ id: string; label: string; appliedFilterPatch: Record<string, unknown> }>;
  };
  memory?: {
    applied: boolean;
    deltas: Array<{ key: string; action: 'SET' | 'DECAY' | 'IGNORE' }>;
  };
  debug?: {
    featureVectorVersion: string;
    modelVersion: string;
    latencyMs: number;
  };
}
