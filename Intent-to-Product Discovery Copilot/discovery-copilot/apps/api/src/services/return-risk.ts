import type { Product, ParsedIntent, ReturnStats } from '@discovery-copilot/types';

/**
 * Predicts the probability that a specific user-product-intent
 * combination will result in a return. Factors in:
 *   - Product's base return rate
 *   - Whether the user's stated use case matches common return reasons
 *   - Fit/size sensitivity for the category
 *   - Whether the user has a history of returns in this category
 *
 * MVP: Rule-based. Phase 2: Gradient-boosted model trained on return events.
 */
export class ReturnRiskService {
  estimateReturnRisk(
    product: Product,
    intent: ParsedIntent,
    userReturnHistory?: { categoryReturnRate: number },
  ): { risk: number; factors: string[]; recommendation: string } {
    const factors: string[] = [];
    let risk = product.returnStats.returnRate;

    // Fit-sensitive categories
    const fitSensitive = this.isFitSensitive(product);
    if (fitSensitive) {
      const hasSizeInfo = intent.attributeRequirements['size'] != null;
      if (!hasSizeInfo) {
        risk += 0.1;
        factors.push('Size/fit not specified — common return reason in this category');
      }
      if (product.returnStats.fitIssueRate > 0.2) {
        risk += 0.05;
        factors.push(`${Math.round(product.returnStats.fitIssueRate * 100)}% of returns cite fit issues`);
      }
    }

    // Expectation mismatch for subjective queries
    const subjectiveTerms = ['comfortable', 'soft', 'premium', 'quiet', 'bright'];
    const hasSubjectiveExpectation = subjectiveTerms.some((term) =>
      intent.rawQuery.toLowerCase().includes(term),
    );
    if (hasSubjectiveExpectation && product.returnStats.expectationMismatchRate > 0.15) {
      risk += 0.05;
      factors.push('Subjective expectations may vary — check reviews for this attribute');
    }

    // User's personal return tendency
    if (userReturnHistory && userReturnHistory.categoryReturnRate > 0.2) {
      risk += 0.03;
      factors.push('Your past returns in this category suggest checking details carefully');
    }

    // Gift purchases have higher return rates
    if (intent.recipient) {
      risk += 0.05;
      factors.push('Gift purchases have a slightly higher return rate');
    }

    risk = Math.min(risk, 1);

    let recommendation: string;
    if (risk < 0.1) recommendation = 'Low return risk';
    else if (risk < 0.2) recommendation = 'Average return risk — check sizing guide';
    else recommendation = 'Higher return risk — review details carefully before purchase';

    return {
      risk: Math.round(risk * 100) / 100,
      factors,
      recommendation,
    };
  }

  private isFitSensitive(product: Product): boolean {
    const fitCategories = [
      'shoes', 'clothing', 'apparel', 'dress', 'pants', 'shirt',
      'jacket', 'boots', 'sneakers', 'bra', 'underwear', 'swimwear',
    ];
    return product.category.breadcrumb.some((cat) =>
      fitCategories.some((fc) => cat.toLowerCase().includes(fc)),
    );
  }
}
