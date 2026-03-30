import type {
  RankingFeatures,
  RankingWeights,
  RankingConfig,
  CompositeScore,
  ScoreComponent,
  Product,
  ParsedIntent,
  LongTermMemory,
} from '@discovery-copilot/types';
import { extractFeatures } from './features';

const DEFAULT_WEIGHTS: RankingWeights = {
  lexicalRelevance: 0.08,
  semanticRelevance: 0.18,
  taxonomyFit: 0.10,
  useCaseFit: 0.16,
  reviewSentiment: 0.10,
  reviewVolume: 0.04,
  returnRisk: 0.08,
  priceFit: 0.10,
  brandAffinity: 0.04,
  availability: 0.03,
  popularity: 0.03,
  conversionPrior: 0.03,
  recency: 0.01,
  diversityPenalty: 0.00,
  noveltyBonus: 0.01,
  businessRuleBoost: 0.01,
};

export interface ScoredProduct {
  product: Product;
  features: RankingFeatures;
  score: CompositeScore;
}

/**
 * Baseline weighted-sum scorer. Every feature contributes a [0,1] signal
 * multiplied by its weight. Weights sum to ~1.0 so the final score stays
 * interpretable. The formula is intentionally simple so it can be replaced
 * with a learned model (LTR) in Phase 2 without changing the interface.
 *
 * Formula:
 *   final = Σ (feature_i × weight_i) + businessRuleBoost − diversityPenalty
 */
export class ProductScorer {
  private weights: RankingWeights;

  constructor(config?: Partial<RankingConfig>) {
    this.weights = config?.weights ?? DEFAULT_WEIGHTS;
  }

  scoreAll(
    products: Product[],
    intent: ParsedIntent,
    memory?: LongTermMemory,
  ): ScoredProduct[] {
    return products
      .map((product) => this.scoreOne(product, intent, memory))
      .sort((a, b) => b.score.final - a.score.final);
  }

  scoreOne(
    product: Product,
    intent: ParsedIntent,
    memory?: LongTermMemory,
  ): ScoredProduct {
    const features = extractFeatures(product, intent, memory);
    const score = this.computeComposite(features);
    return { product, features, score };
  }

  private computeComposite(features: RankingFeatures): CompositeScore {
    const components: ScoreComponent[] = [];
    let final = 0;

    const featureSourceMap: Record<string, ScoreComponent['source']> = {
      lexicalRelevance: 'lexical',
      semanticRelevance: 'semantic',
      taxonomyFit: 'taxonomy',
      useCaseFit: 'semantic',
      reviewSentiment: 'review',
      reviewVolume: 'review',
      returnRisk: 'return',
      priceFit: 'price',
      brandAffinity: 'memory',
      availability: 'business',
      popularity: 'popularity',
      conversionPrior: 'popularity',
      recency: 'business',
      diversityPenalty: 'business',
      noveltyBonus: 'memory',
      businessRuleBoost: 'business',
    };

    for (const [key, weight] of Object.entries(this.weights)) {
      const featureKey = key as keyof RankingFeatures;
      if (featureKey === 'productId') continue;

      const rawScore = features[featureKey] as number;
      const weightedScore = rawScore * weight;

      components.push({
        name: key,
        rawScore,
        weight,
        weightedScore,
        source: featureSourceMap[key] ?? 'business',
      });

      final += weightedScore;
    }

    const normalizedComponents: Record<string, number> = {};
    for (const comp of components) {
      normalizedComponents[comp.name] = final > 0 ? comp.weightedScore / final : 0;
    }

    return {
      final: Math.round(final * 1000) / 1000,
      components,
      normalizedComponents,
    };
  }

  updateWeights(newWeights: Partial<RankingWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  getWeights(): RankingWeights {
    return { ...this.weights };
  }
}
