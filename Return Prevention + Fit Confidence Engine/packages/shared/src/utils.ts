/** Clamp n to [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Map x from [inMin,inMax] to [0,1], clamped. */
export function normalize(x: number, inMin: number, inMax: number): number {
  if (inMax === inMin) return 0.5;
  return clamp((x - inMin) / (inMax - inMin), 0, 1);
}

/** Weighted average; weights must be non-negative. */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length || values.length === 0) {
    throw new RangeError('values and weights must be same non-empty length');
  }
  let num = 0;
  let den = 0;
  for (let i = 0; i < values.length; i++) {
    num += values[i] * weights[i];
    den += weights[i];
  }
  if (den === 0) return 0;
  return num / den;
}

export type ConfidenceLabel = 'high' | 'moderate' | 'low';

/** Map composite fit score to UX label (uses same cutoffs as @fitconfidence/config thresholds). */
export function confidenceToLabel(
  score: number,
  highMin = 0.8,
  moderateMin = 0.5,
): ConfidenceLabel {
  if (score > highMin) return 'high';
  if (score >= moderateMin) return 'moderate';
  return 'low';
}

export type RiskLabel = 'low' | 'moderate' | 'high';

export function riskToLabel(score: number, lowMax = 0.2, moderateMax = 0.5): RiskLabel {
  if (score < lowMax) return 'low';
  if (score <= moderateMax) return 'moderate';
  return 'high';
}

/** Safe parse float; returns undefined if NaN. */
export function parseFiniteNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
