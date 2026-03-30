/**
 * Scoring thresholds, intervention bands, and clarification gating.
 * Aligns API responses with product UX (badges, flows, copy).
 */

/** Fit confidence bands (composite ∈ [0, 1]). */
export const FIT_CONFIDENCE = {
  highMin: 0.8,
  moderateMin: 0.5,
  label: {
    high: 'high' as const,
    moderate: 'moderate' as const,
    low: 'low' as const,
  },
} as const;

export function fitConfidenceBand(score: number): 'high' | 'moderate' | 'low' {
  if (score > FIT_CONFIDENCE.highMin) return 'high';
  if (score >= FIT_CONFIDENCE.moderateMin) return 'moderate';
  return 'low';
}

/** Return risk bands (probability mass ∈ [0, 1]). */
export const RETURN_RISK = {
  lowMax: 0.2,
  moderateMax: 0.5,
} as const;

export function returnRiskBand(score: number): 'low' | 'moderate' | 'high' {
  if (score < RETURN_RISK.lowMax) return 'low';
  if (score <= RETURN_RISK.moderateMax) return 'moderate';
  return 'high';
}

/** Intervention ladder (matches risk-scoring.service defaults). */
export const INTERVENTION_THRESHOLDS = {
  tauInfo: 0.35,
  tauWarn: 0.55,
  tauSoftBlock: 0.72,
} as const;

export type InterventionKind = 'INFO' | 'WARN' | 'SOFT_BLOCK' | 'SUGGEST_ALT';

export function interventionsForRisk(riskScore: number): InterventionKind[] {
  const out: InterventionKind[] = [];
  if (riskScore > INTERVENTION_THRESHOLDS.tauInfo) out.push('INFO');
  if (riskScore > INTERVENTION_THRESHOLDS.tauWarn) out.push('WARN');
  if (riskScore > INTERVENTION_THRESHOLDS.tauSoftBlock) out.push('SOFT_BLOCK');
  return out;
}

export const CLARIFICATION_THRESHOLDS = {
  maxTotalUncertainty: 0.42,
  maxEpistemicUncertainty: 0.38,
  fitConfidenceClarifyCross: 0.62,
  maxQuestions: 3,
} as const;

export const DECISION_THRESHOLDS = {
  riskConsiderAlt: 0.55,
  riskStrongAlt: 0.72,
  fitBuySafe: 0.78,
  riskBuySafe: 0.38,
  uncertaintyClarify: 0.48,
  uncertaintyRefine: 0.4,
} as const;
