/**
 * Offline metrics for scoring quality: accuracy, calibration, grounding, utility.
 */

/** 1 if predicted primary size matches expected label (exact). */
export function sizeRecommendationAccuracy(predictedLabel: string, expectedLabel: string): number {
  return predictedLabel.trim().toLowerCase() === expectedLabel.trim().toLowerCase() ? 1 : 0;
}

/**
 * Calibration for fit confidence: 1 if predicted lies within [min,max], else linear penalty by distance to nearest bound.
 */
export function fitConfidenceCalibration(predicted: number, expectedMin: number, expectedMax: number): number {
  if (predicted >= expectedMin && predicted <= expectedMax) return 1;
  const half = (expectedMax - expectedMin) / 2 || 0.05;
  const dist = Math.min(Math.abs(predicted - expectedMin), Math.abs(predicted - expectedMax));
  return Math.max(0, 1 - dist / (half * 2));
}

export function returnRiskCalibration(predicted: number, expectedMin: number, expectedMax: number): number {
  return fitConfidenceCalibration(predicted, expectedMin, expectedMax);
}

/** Fraction of citations with non-zero weight (proxy for grounded explanations). */
export function explanationGroundingRate(citations: Array<{ weight: number }>): number {
  if (!citations.length) return 0;
  const grounded = citations.filter((c) => c.weight > 0).length;
  return grounded / citations.length;
}

/** Mean reciprocal rank of first acceptable alternative (1-based); 0 if none. */
export function alternativeUtility(
  rankedProductIds: string[],
  acceptableIds: Set<string>,
): number {
  for (let i = 0; i < rankedProductIds.length; i++) {
    if (acceptableIds.has(rankedProductIds[i])) return 1 / (i + 1);
  }
  return 0;
}

/**
 * Precision of clarification questions: fraction of asked questions that map to sparse features.
 */
export function clarificationPrecision(
  askedQuestionIds: string[],
  relevantQuestionIds: Set<string>,
): number {
  if (!askedQuestionIds.length) return 1;
  const hits = askedQuestionIds.filter((q) => relevantQuestionIds.has(q)).length;
  return hits / askedQuestionIds.length;
}

/** Macro accuracy over binary hits. */
export function meanMetric(scores: number[]): number {
  if (!scores.length) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
