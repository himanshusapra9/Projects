import { EvidenceRef } from './decision.types';

export interface FitDimensionScore {
  key: string;
  label: string;
  score: number;
  weight: number;
  detail?: string;
}

export interface FitConfidenceAssessment {
  confidence: number;
  categoryKind: string;
  evidence: EvidenceRef[];
  dimensions: FitDimensionScore[];
  betweenSizeNote?: string;
  uncertainty: { epistemic: number; aleatoric: number; total: number };
}

export interface SizeAlternative {
  variantId: string;
  label: string;
  fitScore: number;
  riskPenalty: number;
  composite: number;
}

export interface SizeRecommendation {
  recommendedSize: string;
  recommendedVariantId?: string;
  confidence: number;
  betweenSize: boolean;
  rationale: string;
  alternatives: SizeAlternative[];
  measurementUnit?: 'IN' | 'CM';
}

export interface RiskFactor {
  code: string;
  weight: number;
  preventable: boolean;
  label: string;
}

export interface Intervention {
  id: string;
  kind: 'INFO' | 'WARN' | 'SOFT_BLOCK' | 'SUGGEST_ALT';
  message: string;
  thresholdCrossed?: string;
}

export interface ReturnRiskProfile {
  riskScore: number;
  preventableShare: number;
  factors: RiskFactor[];
  interventions: Intervention[];
  nonPreventableShare: number;
}
