import type { ConfidenceScore, ParsedIntent, RankedCandidate } from '@discovery-copilot/types';

/**
 * Confidence scoring quantifies how sure the system is that the
 * recommended set actually matches the user's latent need.
 * 
 * We combine four independent signals:
 *   1. Intent clarity — how well we understood the query
 *   2. Catalog coverage — did we find enough candidates?
 *   3. Attribute match rate — do top products cover stated requirements?
 *   4. Score separation — is #1 clearly better than #5, or is it a toss-up?
 *
 * The overall confidence drives UX behavior:
 *   > 0.7 → show results confidently
 *   0.4–0.7 → show results + suggest refinement
 *   < 0.4 → lead with a clarifying question
 */
export function computeConfidenceScore(
  intent: ParsedIntent,
  candidates: RankedCandidate[],
  totalRetrieved: number,
): ConfidenceScore {
  if (candidates.length === 0) {
    return {
      overall: 0.05,
      catalogCoverage: 0,
      intentClarity: intent.confidence,
      attributeMatchRate: 0,
      reviewSupport: 0,
      uncertaintyFactors: ['No matching products found', ...intent.ambiguityFactors],
      recommendation: 'low_ask_clarification',
    };
  }

  const intentClarity = intent.confidence;
  const catalogCoverage = computeCatalogCoverage(candidates.length, totalRetrieved);
  const attributeMatchRate = computeAttributeMatchRate(candidates, intent);
  const reviewSupport = computeReviewSupport(candidates);
  const scoreSeparation = computeScoreSeparation(candidates);

  const overall =
    intentClarity * 0.30 +
    catalogCoverage * 0.15 +
    attributeMatchRate * 0.25 +
    reviewSupport * 0.15 +
    scoreSeparation * 0.15;

  const roundedOverall = Math.round(overall * 100) / 100;
  const uncertaintyFactors = collectUncertaintyFactors(
    intent,
    candidates,
    { intentClarity, catalogCoverage, attributeMatchRate, reviewSupport, scoreSeparation },
  );

  let recommendation: ConfidenceScore['recommendation'];
  if (roundedOverall > 0.7) recommendation = 'high_confidence';
  else if (roundedOverall > 0.4) recommendation = 'moderate_needs_refinement';
  else recommendation = 'low_ask_clarification';

  return {
    overall: roundedOverall,
    catalogCoverage,
    intentClarity,
    attributeMatchRate,
    reviewSupport,
    uncertaintyFactors,
    recommendation,
  };
}

function computeCatalogCoverage(candidateCount: number, totalRetrieved: number): number {
  if (totalRetrieved === 0) return 0;
  if (candidateCount >= 10) return 1.0;
  if (candidateCount >= 5) return 0.8;
  if (candidateCount >= 3) return 0.6;
  return candidateCount * 0.15;
}

function computeAttributeMatchRate(
  candidates: RankedCandidate[],
  intent: ParsedIntent,
): number {
  const requiredCount =
    Object.keys(intent.attributeRequirements).length + intent.useCases.length;

  if (requiredCount === 0) return 0.7;

  const top3 = candidates.slice(0, 3);
  const avgMatched = top3.reduce(
    (sum, c) => sum + c.matchedAttributes.length,
    0,
  ) / top3.length;

  return Math.min(avgMatched / requiredCount, 1);
}

function computeReviewSupport(candidates: RankedCandidate[]): number {
  const top3 = candidates.slice(0, 3);
  const avgReviews = top3.reduce(
    (sum, c) => sum + c.product.reviewSummary.totalReviews,
    0,
  ) / top3.length;

  if (avgReviews >= 100) return 1.0;
  if (avgReviews >= 50) return 0.8;
  if (avgReviews >= 10) return 0.6;
  if (avgReviews >= 3) return 0.4;
  return 0.2;
}

function computeScoreSeparation(candidates: RankedCandidate[]): number {
  if (candidates.length < 2) return 0.5;

  const topScore = candidates[0].score.final;
  const fifthScore = candidates[Math.min(4, candidates.length - 1)].score.final;

  if (topScore === 0) return 0;

  const separation = (topScore - fifthScore) / topScore;
  // Higher separation = clearer winner = higher confidence
  return Math.min(separation * 2, 1);
}

function collectUncertaintyFactors(
  intent: ParsedIntent,
  candidates: RankedCandidate[],
  scores: Record<string, number>,
): string[] {
  const factors: string[] = [];

  if (scores.intentClarity < 0.5) {
    factors.push('Query is vague or ambiguous');
  }
  if (scores.catalogCoverage < 0.5) {
    factors.push('Limited product selection in this category');
  }
  if (scores.attributeMatchRate < 0.5) {
    factors.push('Some requirements could not be matched in catalog data');
  }
  if (scores.reviewSupport < 0.5) {
    factors.push('Limited review data for top products');
  }
  if (scores.scoreSeparation < 0.3) {
    factors.push('Multiple products score similarly — refinement would help differentiate');
  }

  factors.push(...intent.ambiguityFactors.slice(0, 3));

  return [...new Set(factors)];
}
