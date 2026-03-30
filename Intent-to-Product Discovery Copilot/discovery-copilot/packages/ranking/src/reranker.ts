import type {
  RankedCandidate,
  ParsedIntent,
  LongTermMemory,
  DiversityConstraints,
  MatchedAttribute,
  RecommendationBadge,
  BadgeType,
} from '@discovery-copilot/types';
import { ProductScorer, type ScoredProduct } from './scorer';

const DEFAULT_DIVERSITY: DiversityConstraints = {
  maxSameBrand: 2,
  maxSameSubcategory: 3,
  minPriceSpread: 0.2,
  requireDifferentStyles: true,
  diversityWeight: 0.15,
};

/**
 * Two-phase ranking:
 *   Phase 1 (scorer): Compute raw feature-weighted scores for all candidates.
 *   Phase 2 (reranker): Apply diversity constraints, budget logic, and
 *     generate badges + matched attributes for the final result set.
 */
export class ProductReranker {
  private scorer: ProductScorer;
  private diversity: DiversityConstraints;

  constructor(
    scorer: ProductScorer,
    diversity: DiversityConstraints = DEFAULT_DIVERSITY,
  ) {
    this.scorer = scorer;
    this.diversity = diversity;
  }

  rerank(
    scored: ScoredProduct[],
    intent: ParsedIntent,
    limit: number = 10,
    memory?: LongTermMemory,
  ): RankedCandidate[] {
    // Apply hard filters first
    let filtered = this.applyHardFilters(scored, intent);

    // Apply diversity re-ranking using MMR-style selection
    const diverse = this.applyDiversity(filtered, limit);

    // Assign ranks, badges, and matched attributes
    return diverse.map((sp, index) => this.toRankedCandidate(sp, index, intent));
  }

  private applyHardFilters(
    scored: ScoredProduct[],
    intent: ParsedIntent,
  ): ScoredProduct[] {
    return scored.filter((sp) => {
      // Must be in stock
      if (!sp.product.availability.inStock) return false;

      for (const constraint of intent.constraints) {
        if (!constraint.isHard) continue;

        if (constraint.type === 'budget' && constraint.operator === 'lte') {
          const maxPrice = constraint.value as number;
          // Allow 10% over budget if the product is exceptional
          if (sp.product.price.amount > maxPrice * 1.1) return false;
        }

        if (constraint.type === 'brand' && constraint.operator === 'not_in') {
          const excludedBrands = constraint.value as string[];
          if (excludedBrands.some(
            (b) => b.toLowerCase() === sp.product.brand.toLowerCase(),
          )) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Maximal Marginal Relevance–inspired selection. Greedily picks
   * the highest-scoring candidate that is sufficiently different from
   * already-selected ones, enforcing brand and subcategory caps.
   */
  private applyDiversity(
    scored: ScoredProduct[],
    limit: number,
  ): ScoredProduct[] {
    const selected: ScoredProduct[] = [];
    const brandCounts: Record<string, number> = {};
    const subcategoryCounts: Record<string, number> = {};

    for (const sp of scored) {
      if (selected.length >= limit) break;

      const brand = sp.product.brand;
      const subcategory = sp.product.category.l2;

      if ((brandCounts[brand] ?? 0) >= this.diversity.maxSameBrand) continue;
      if ((subcategoryCounts[subcategory] ?? 0) >= this.diversity.maxSameSubcategory) continue;

      selected.push(sp);
      brandCounts[brand] = (brandCounts[brand] ?? 0) + 1;
      subcategoryCounts[subcategory] = (subcategoryCounts[subcategory] ?? 0) + 1;
    }

    // If diversity filtering was too aggressive, backfill from top scores
    if (selected.length < Math.min(limit, scored.length)) {
      for (const sp of scored) {
        if (selected.length >= limit) break;
        if (!selected.includes(sp)) {
          selected.push(sp);
        }
      }
    }

    return selected;
  }

  private toRankedCandidate(
    sp: ScoredProduct,
    rank: number,
    intent: ParsedIntent,
  ): RankedCandidate {
    return {
      product: sp.product,
      rank: rank + 1,
      score: sp.score,
      explanation: {
        headline: '',
        reasons: [],
        caveats: [],
        reviewHighlights: [],
      },
      badges: this.assignBadges(sp, rank),
      tradeoffs: this.identifyTradeoffs(sp, intent),
      confidence: sp.score.final,
      matchedAttributes: this.extractMatchedAttributes(sp, intent),
    };
  }

  private assignBadges(sp: ScoredProduct, rank: number): RecommendationBadge[] {
    const badges: RecommendationBadge[] = [];

    if (rank === 0) {
      badges.push({
        type: 'best_match',
        label: 'Best Match',
        tooltip: 'Highest overall score for your requirements',
      });
    }

    if (sp.features.returnRisk > 0.85) {
      badges.push({
        type: 'low_return_risk',
        label: 'Low Return Risk',
        tooltip: 'Very low return rate for this type of product',
      });
    }

    if (sp.product.reviewSummary.averageRating >= 4.5 &&
        sp.product.reviewSummary.totalReviews >= 50) {
      badges.push({
        type: 'top_rated',
        label: 'Top Rated',
        tooltip: `${sp.product.reviewSummary.averageRating} stars from ${sp.product.reviewSummary.totalReviews} reviews`,
      });
    }

    if (sp.features.priceFit > 0.9 && sp.features.useCaseFit > 0.7) {
      badges.push({
        type: 'best_value',
        label: 'Best Value',
        tooltip: 'Great fit at a good price point',
      });
    }

    if (sp.features.useCaseFit > 0.85) {
      badges.push({
        type: 'great_for_use_case',
        label: 'Great Fit',
        tooltip: 'Closely matches your specific use case',
      });
    }

    return badges.slice(0, 3); // max 3 badges per product
  }

  private identifyTradeoffs(
    sp: ScoredProduct,
    intent: ParsedIntent,
  ): RankedCandidate['tradeoffs'] {
    const tradeoffs: RankedCandidate['tradeoffs'] = [];

    if (sp.features.priceFit < 0.5 && intent.priceRange?.max) {
      const overBy = sp.product.price.amount - (intent.priceRange.max ?? 0);
      if (overBy > 0) {
        tradeoffs.push({
          attribute: 'price',
          description: `$${overBy.toFixed(0)} over your budget, but highly rated for your needs`,
          severity: overBy / (intent.priceRange.max ?? 100) > 0.2 ? 'significant' : 'notable',
        });
      }
    }

    if (sp.features.returnRisk < 0.5) {
      tradeoffs.push({
        attribute: 'return_risk',
        description: `Higher return rate (${Math.round(sp.product.returnStats.returnRate * 100)}%) — check sizing carefully`,
        severity: sp.features.returnRisk < 0.3 ? 'significant' : 'notable',
      });
    }

    if (sp.features.reviewVolume < 0.3) {
      tradeoffs.push({
        attribute: 'reviews',
        description: 'Limited reviews available — newer or niche product',
        severity: 'minor',
      });
    }

    return tradeoffs;
  }

  private extractMatchedAttributes(
    sp: ScoredProduct,
    intent: ParsedIntent,
  ): MatchedAttribute[] {
    const matched: MatchedAttribute[] = [];

    for (const [attr, required] of Object.entries(intent.attributeRequirements)) {
      const productValue = sp.product.attributes[attr];
      if (productValue != null) {
        const requiredStr = String(required).toLowerCase();
        const productStr = Array.isArray(productValue)
          ? productValue.join(' ').toLowerCase()
          : String(productValue).toLowerCase();

        if (productStr.includes(requiredStr) || requiredStr.includes(productStr)) {
          matched.push({
            queryAttribute: attr,
            productAttribute: String(productValue),
            matchType: 'exact',
            confidence: 0.9,
          });
        }
      }
    }

    for (const useCase of intent.useCases) {
      const useCases = sp.product.attributes.useCase ?? [];
      if (useCases.some((uc) => uc.toLowerCase().includes(useCase.toLowerCase()))) {
        matched.push({
          queryAttribute: useCase,
          productAttribute: useCases.join(', '),
          matchType: 'exact',
          confidence: 0.85,
        });
      }
    }

    return matched;
  }
}
