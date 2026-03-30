import type { Product, RankedCandidate } from '@discovery-copilot/types';

export interface GuardrailResult {
  passed: boolean;
  violations: GuardrailViolation[];
  filtered: RankedCandidate[];
  warnings: string[];
}

export interface GuardrailViolation {
  rule: string;
  severity: 'block' | 'warn' | 'flag';
  description: string;
  productId?: string;
  evidence?: string;
}

const MEDICAL_CLAIM_PATTERNS = [
  /\bcures?\b/i,
  /\btreats?\b/i,
  /\bdiagnos/i,
  /\bprevents?\s+(disease|cancer|illness)/i,
  /\bFDA\s+approved\s+for\b/i,
  /\bclinically\s+proven\s+to\s+(cure|treat|prevent)/i,
];

const AGE_RESTRICTED_CATEGORIES = [
  'alcohol',
  'tobacco',
  'firearms',
  'ammunition',
  'adult',
];

export function runGuardrails(
  candidates: RankedCandidate[],
  explanationTexts: string[],
  context: { userAge?: number; locale: string },
): GuardrailResult {
  const violations: GuardrailViolation[] = [];
  const warnings: string[] = [];
  let filtered = [...candidates];

  filtered = checkOutOfStock(filtered, violations);
  filtered = checkAgeRestrictions(filtered, violations, context.userAge);
  checkMedicalClaims(explanationTexts, violations);
  checkPriceConsistency(filtered, violations);
  checkHallucinationRisk(filtered, explanationTexts, violations);
  checkDiversityFloor(filtered, warnings);
  checkOverPersonalization(filtered, warnings);

  return {
    passed: violations.filter((v) => v.severity === 'block').length === 0,
    violations,
    filtered,
    warnings,
  };
}

function checkOutOfStock(
  candidates: RankedCandidate[],
  violations: GuardrailViolation[],
): RankedCandidate[] {
  return candidates.filter((c) => {
    if (!c.product.availability.inStock) {
      violations.push({
        rule: 'no_out_of_stock',
        severity: 'block',
        description: `Product "${c.product.name}" is out of stock`,
        productId: c.product.id,
      });
      return false;
    }
    return true;
  });
}

function checkAgeRestrictions(
  candidates: RankedCandidate[],
  violations: GuardrailViolation[],
  userAge?: number,
): RankedCandidate[] {
  return candidates.filter((c) => {
    const isRestricted = AGE_RESTRICTED_CATEGORIES.some(
      (cat) =>
        c.product.category.breadcrumb.some((b) =>
          b.toLowerCase().includes(cat),
        ),
    );

    if (isRestricted && (!userAge || userAge < 21)) {
      violations.push({
        rule: 'age_restriction',
        severity: 'block',
        description: `Product "${c.product.name}" is age-restricted`,
        productId: c.product.id,
      });
      return false;
    }
    return true;
  });
}

function checkMedicalClaims(
  explanationTexts: string[],
  violations: GuardrailViolation[],
): void {
  for (const text of explanationTexts) {
    for (const pattern of MEDICAL_CLAIM_PATTERNS) {
      if (pattern.test(text)) {
        violations.push({
          rule: 'no_medical_claims',
          severity: 'block',
          description: 'Explanation contains potential medical claim',
          evidence: text.slice(0, 200),
        });
      }
    }
  }
}

function checkPriceConsistency(
  candidates: RankedCandidate[],
  violations: GuardrailViolation[],
): void {
  for (const c of candidates) {
    for (const reason of c.explanation.reasons) {
      const priceMatch = reason.text.match(/\$(\d+(?:\.\d{2})?)/);
      if (priceMatch) {
        const mentionedPrice = parseFloat(priceMatch[1]);
        const actualPrice = c.product.price.amount;
        if (Math.abs(mentionedPrice - actualPrice) > 0.01) {
          violations.push({
            rule: 'price_consistency',
            severity: 'block',
            description: `Explanation mentions $${mentionedPrice} but product costs $${actualPrice}`,
            productId: c.product.id,
          });
        }
      }
    }
  }
}

function checkHallucinationRisk(
  candidates: RankedCandidate[],
  explanationTexts: string[],
  violations: GuardrailViolation[],
): void {
  for (const c of candidates) {
    for (const highlight of c.explanation.reviewHighlights) {
      if (highlight.snippet.length > 0 && highlight.relevance < 0.3) {
        violations.push({
          rule: 'review_grounding',
          severity: 'warn',
          description: `Low-relevance review snippet used for ${c.product.name}`,
          productId: c.product.id,
          evidence: highlight.snippet.slice(0, 100),
        });
      }
    }
  }
}

function checkDiversityFloor(
  candidates: RankedCandidate[],
  warnings: string[],
): void {
  if (candidates.length < 3) return;

  const brands = new Set(candidates.slice(0, 5).map((c) => c.product.brand));
  if (brands.size === 1) {
    warnings.push(
      `All top 5 recommendations are from the same brand (${candidates[0].product.brand}). Consider diversifying.`,
    );
  }

  const priceRange =
    Math.max(...candidates.slice(0, 5).map((c) => c.product.price.amount)) -
    Math.min(...candidates.slice(0, 5).map((c) => c.product.price.amount));
  if (priceRange < 5) {
    warnings.push(
      'Top 5 recommendations have very similar prices. Consider showing a range.',
    );
  }
}

function checkOverPersonalization(
  candidates: RankedCandidate[],
  warnings: string[],
): void {
  const memorySourcedScores = candidates
    .slice(0, 5)
    .map((c) => {
      const memoryComponent = c.score.components.find(
        (comp) => comp.source === 'memory',
      );
      return memoryComponent?.weightedScore ?? 0;
    });

  const avgMemoryInfluence =
    memorySourcedScores.reduce((a, b) => a + b, 0) / memorySourcedScores.length;

  if (avgMemoryInfluence > 0.4) {
    warnings.push(
      'Recommendations are heavily influenced by user memory. Ensure there is room for discovery.',
    );
  }
}
