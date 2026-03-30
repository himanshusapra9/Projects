import type {
  Product,
  ParsedIntent,
  LongTermMemory,
  RankingFeatures,
} from '@discovery-copilot/types';

/**
 * Computes the raw feature vector for a single product against a parsed intent.
 * Each feature is normalized to [0, 1] where 1 = best possible fit.
 */
export function extractFeatures(
  product: Product,
  intent: ParsedIntent,
  memory?: LongTermMemory,
): RankingFeatures {
  return {
    productId: product.id,
    lexicalRelevance: computeLexicalRelevance(product, intent),
    semanticRelevance: computeSemanticRelevance(product, intent),
    taxonomyFit: computeTaxonomyFit(product, intent),
    useCaseFit: computeUseCaseFit(product, intent),
    reviewSentiment: computeReviewSentiment(product, intent),
    reviewVolume: computeReviewVolume(product),
    returnRisk: computeReturnRisk(product, intent),
    priceFit: computePriceFit(product, intent),
    brandAffinity: computeBrandAffinity(product, memory),
    availability: computeAvailability(product),
    popularity: computePopularity(product),
    conversionPrior: computeConversionPrior(product),
    recency: computeRecency(product),
    diversityPenalty: 0, // set during re-ranking pass
    noveltyBonus: computeNoveltyBonus(product, memory),
    businessRuleBoost: 0, // set by business rules layer
  };
}

function computeLexicalRelevance(product: Product, intent: ParsedIntent): number {
  const queryTerms = intent.rawQuery.toLowerCase().split(/\s+/);
  const productText = `${product.name} ${product.description} ${product.brand}`.toLowerCase();

  let matched = 0;
  for (const term of queryTerms) {
    if (term.length > 2 && productText.includes(term)) {
      matched++;
    }
  }

  return queryTerms.length > 0 ? matched / queryTerms.length : 0;
}

function computeSemanticRelevance(product: Product, intent: ParsedIntent): number {
  // In production, this uses pre-computed embeddings and cosine similarity.
  // For MVP, we use a heuristic based on attribute overlap.
  if (!product.embeddings?.titleDescription) return 0.5;

  // Placeholder: would call vector similarity against intent embedding
  return 0.5;
}

function computeTaxonomyFit(product: Product, intent: ParsedIntent): number {
  const categoryHints = intent.categoryHints.map((h) => h.toLowerCase());
  if (categoryHints.length === 0) return 0.5;

  const productCategories = product.category.breadcrumb.map((c) => c.toLowerCase());

  for (const hint of categoryHints) {
    if (productCategories.some((pc) => pc.includes(hint) || hint.includes(pc))) {
      return 1.0;
    }
  }

  // Partial match at higher taxonomy level
  if (productCategories.some((pc) =>
    categoryHints.some((h) => pc.split('/')[0] === h.split('/')[0]),
  )) {
    return 0.6;
  }

  return 0.2;
}

function computeUseCaseFit(product: Product, intent: ParsedIntent): number {
  if (intent.useCases.length === 0) return 0.5;

  const productUseCases = product.attributes.useCase ?? [];
  const productDesc = product.description.toLowerCase();

  let matched = 0;
  for (const useCase of intent.useCases) {
    const ucLower = useCase.toLowerCase();
    if (
      productUseCases.some((pu) => pu.toLowerCase().includes(ucLower)) ||
      productDesc.includes(ucLower)
    ) {
      matched++;
    }
  }

  return intent.useCases.length > 0 ? matched / intent.useCases.length : 0.5;
}

function computeReviewSentiment(product: Product, intent: ParsedIntent): number {
  const summary = product.reviewSummary;
  if (summary.totalReviews === 0) return 0.5;

  const baseScore = (summary.averageRating - 1) / 4; // normalize 1-5 to 0-1

  // Boost if positive themes match the user's use cases
  const relevantPositiveThemes = summary.topPositiveThemes.filter((theme) =>
    intent.useCases.some((uc) =>
      theme.theme.toLowerCase().includes(uc.toLowerCase()),
    ),
  );

  const themeBoost = Math.min(relevantPositiveThemes.length * 0.1, 0.2);

  return Math.min(baseScore + themeBoost, 1);
}

function computeReviewVolume(product: Product): number {
  const reviews = product.reviewSummary.totalReviews;
  // Logarithmic scaling: 0 reviews = 0, 10 = 0.5, 100 = 0.75, 1000+ = 1.0
  if (reviews === 0) return 0;
  return Math.min(Math.log10(reviews) / 3, 1);
}

function computeReturnRisk(product: Product, intent: ParsedIntent): number {
  const stats = product.returnStats;
  // Invert: low return rate = high score
  const baseScore = 1 - Math.min(stats.returnRate, 0.3) / 0.3;

  // Penalize more if the return reasons match the user's priorities
  const fitSensitive = intent.attributeRequirements['size'] != null ||
    intent.attributeRequirements['fit'] != null;

  if (fitSensitive && stats.fitIssueRate > 0.15) {
    return baseScore * 0.7;
  }

  return baseScore;
}

function computePriceFit(product: Product, intent: ParsedIntent): number {
  const price = product.price.amount;
  const range = intent.priceRange;

  if (!range?.max && !range?.min) return 0.7; // no price preference

  if (range.max && price > range.max) {
    const overPercent = (price - range.max) / range.max;
    return Math.max(0, 1 - overPercent * 3); // steep penalty for over-budget
  }

  if (range.min && price < range.min) {
    const underPercent = (range.min - price) / range.min;
    return Math.max(0.3, 1 - underPercent);
  }

  // Within range: prefer products that use 60-85% of budget (value sweet spot)
  if (range.max) {
    const utilization = price / range.max;
    if (utilization >= 0.6 && utilization <= 0.85) return 1.0;
    if (utilization < 0.6) return 0.7 + utilization * 0.3;
    return 0.9;
  }

  return 0.8;
}

function computeBrandAffinity(product: Product, memory?: LongTermMemory): number {
  if (!memory) return 0.5;

  const brandPref = memory.preferences.preferredBrands.find(
    (b) => b.brand.toLowerCase() === product.brand.toLowerCase(),
  );
  if (brandPref) return 0.5 + brandPref.score * 0.5;

  const isDisliked = memory.preferences.dislikedBrands.some(
    (b) => b.toLowerCase() === product.brand.toLowerCase(),
  );
  if (isDisliked) return 0.1;

  return 0.5;
}

function computeAvailability(product: Product): number {
  if (!product.availability.inStock) return 0;
  if (product.availability.quantity != null && product.availability.quantity < 3) return 0.7;
  if (product.availability.backorderDate) return 0.5;
  return 1.0;
}

function computePopularity(product: Product): number {
  // Based on review volume as a proxy for popularity
  const reviews = product.reviewSummary.totalReviews;
  return Math.min(Math.log10(Math.max(reviews, 1)) / 4, 1);
}

function computeConversionPrior(product: Product): number {
  // In production, this uses historical conversion data.
  // For MVP, approximate from rating + review volume.
  const ratingScore = (product.reviewSummary.averageRating - 1) / 4;
  const volumeScore = computeReviewVolume(product);
  return ratingScore * 0.6 + volumeScore * 0.4;
}

function computeRecency(product: Product): number {
  const daysSinceUpdate =
    (Date.now() - new Date(product.updatedAt).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate < 30) return 1.0;
  if (daysSinceUpdate < 90) return 0.8;
  if (daysSinceUpdate < 365) return 0.6;
  return 0.4;
}

function computeNoveltyBonus(product: Product, memory?: LongTermMemory): number {
  if (!memory) return 0;

  const hasInteracted = memory.productInteractions.some(
    (i) => i.productId === product.id,
  );

  return hasInteracted ? 0 : 0.1;
}
