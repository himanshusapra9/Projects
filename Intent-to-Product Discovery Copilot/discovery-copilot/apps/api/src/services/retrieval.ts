import type { Product, ParsedIntent } from '@discovery-copilot/types';
import type { RetrievalService } from '@discovery-copilot/ai';

/**
 * Hybrid retrieval pipeline:
 *   1. Lexical search (BM25) against product name + description
 *   2. Vector similarity against intent embedding
 *   3. Faceted filter expansion from parsed constraints
 *   4. Merge and deduplicate using reciprocal rank fusion
 *
 * MVP: Wraps Elasticsearch/pgvector. Production: adds review-snippet
 * retrieval, use-case attribute mapping, and synonym expansion.
 */
export class HybridRetrievalService implements RetrievalService {
  async retrieve(intent: ParsedIntent, limit: number): Promise<Product[]> {
    const [lexicalResults, semanticResults] = await Promise.all([
      this.lexicalSearch(intent, limit * 2),
      this.semanticSearch(intent, limit * 2),
    ]);

    const fused = this.reciprocalRankFusion(lexicalResults, semanticResults);
    const filtered = this.applyConstraintFilters(fused, intent);

    return filtered.slice(0, limit);
  }

  private async lexicalSearch(intent: ParsedIntent, limit: number): Promise<Product[]> {
    // In production: Elasticsearch query with BM25
    //
    // const query = {
    //   bool: {
    //     should: [
    //       { match: { name: { query: intent.rawQuery, boost: 2 } } },
    //       { match: { description: intent.rawQuery } },
    //       { match: { 'attributes.useCase': intent.useCases.join(' ') } },
    //     ],
    //     filter: this.buildFilters(intent),
    //   },
    // };
    //
    // return await esClient.search({ index: 'products', body: { query, size: limit } });

    return [];
  }

  private async semanticSearch(intent: ParsedIntent, limit: number): Promise<Product[]> {
    // In production: embed the query, search pgvector or Pinecone
    //
    // const queryEmbedding = await llm.embed({ model: 'text-embedding-3-small', texts: [intent.rawQuery] });
    // return await pgvector.query('product_embeddings', queryEmbedding[0], limit);

    return [];
  }

  /**
   * Reciprocal Rank Fusion merges two ranked lists into one.
   * Score = Σ 1/(k + rank_i) for each list where the product appears.
   * k=60 is the standard constant that controls rank saturation.
   */
  private reciprocalRankFusion(
    listA: Product[],
    listB: Product[],
    k: number = 60,
  ): Product[] {
    const scores = new Map<string, { product: Product; score: number }>();

    for (let i = 0; i < listA.length; i++) {
      const p = listA[i];
      const existing = scores.get(p.id);
      const rrf = 1 / (k + i + 1);
      scores.set(p.id, {
        product: p,
        score: (existing?.score ?? 0) + rrf,
      });
    }

    for (let i = 0; i < listB.length; i++) {
      const p = listB[i];
      const existing = scores.get(p.id);
      const rrf = 1 / (k + i + 1);
      scores.set(p.id, {
        product: existing?.product ?? p,
        score: (existing?.score ?? 0) + rrf,
      });
    }

    return [...scores.values()]
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);
  }

  private applyConstraintFilters(
    products: Product[],
    intent: ParsedIntent,
  ): Product[] {
    return products.filter((p) => {
      for (const constraint of intent.constraints) {
        if (!constraint.isHard) continue;

        if (constraint.type === 'budget') {
          const maxPrice = constraint.value as number;
          if (p.price.amount > maxPrice * 1.1) return false;
        }

        if (constraint.type === 'brand' && constraint.operator === 'not_in') {
          const excluded = constraint.value as string[];
          if (excluded.some((b) => b.toLowerCase() === p.brand.toLowerCase())) {
            return false;
          }
        }
      }

      if (!p.availability.inStock) return false;

      return true;
    });
  }
}

/**
 * Maps subjective user language to concrete product attributes
 * and review themes. This is the bridge between how shoppers talk
 * and how catalogs are structured.
 */
export const SUBJECTIVE_ATTRIBUTE_MAP: Record<string, {
  catalogAttributes: string[];
  reviewThemes: string[];
  searchExpansions: string[];
}> = {
  comfortable: {
    catalogAttributes: ['cushioning', 'ergonomic', 'padded', 'soft'],
    reviewThemes: ['comfort', 'cushion', 'supportive', 'all-day wear'],
    searchExpansions: ['comfort', 'cushioned', 'ergonomic', 'supportive', 'plush'],
  },
  durable: {
    catalogAttributes: ['material_quality', 'construction', 'warranty'],
    reviewThemes: ['lasted', 'sturdy', 'well-made', 'held up', 'quality'],
    searchExpansions: ['durable', 'long-lasting', 'heavy-duty', 'rugged', 'well-built'],
  },
  minimalist: {
    catalogAttributes: ['style', 'design', 'aesthetic'],
    reviewThemes: ['clean', 'simple', 'sleek', 'understated'],
    searchExpansions: ['minimalist', 'minimal', 'simple', 'clean design', 'understated'],
  },
  'good for travel': {
    catalogAttributes: ['weight', 'portability', 'dimensions', 'foldable'],
    reviewThemes: ['travel', 'carry-on', 'lightweight', 'portable', 'compact'],
    searchExpansions: ['travel', 'portable', 'lightweight', 'compact', 'carry-on'],
  },
  'easy to clean': {
    catalogAttributes: ['material', 'washable', 'stain_resistant'],
    reviewThemes: ['easy to clean', 'wipes clean', 'machine washable', 'stain resistant'],
    searchExpansions: ['washable', 'stain-resistant', 'easy clean', 'machine wash'],
  },
  'premium but not flashy': {
    catalogAttributes: ['material_quality', 'brand_tier', 'design'],
    reviewThemes: ['quality', 'subtle', 'understated luxury', 'well-crafted'],
    searchExpansions: ['premium', 'high-quality', 'understated', 'refined', 'subtle'],
  },
  quiet: {
    catalogAttributes: ['noise_level', 'decibels'],
    reviewThemes: ['quiet', 'silent', 'noise', 'loud', 'whisper'],
    searchExpansions: ['quiet', 'low noise', 'silent', 'whisper-quiet'],
  },
  'good for sensitive skin': {
    catalogAttributes: ['hypoallergenic', 'fragrance_free', 'ingredients'],
    reviewThemes: ['sensitive skin', 'no irritation', 'gentle', 'hypoallergenic'],
    searchExpansions: ['sensitive skin', 'hypoallergenic', 'gentle', 'fragrance-free'],
  },
};
