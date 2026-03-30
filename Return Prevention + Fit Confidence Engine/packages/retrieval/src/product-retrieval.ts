/**
 * Product retrieval with pgvector-style similarity and deterministic reranking.
 */

import type { Product, ProductCategory } from "@return-prevention/types";

export interface RetrievalFilters {
  category?: ProductCategory;
  tenantId?: string;
  maxPriceMinor?: number;
  inStockOnly?: boolean;
  excludeProductIds?: string[];
}

export interface ShopperPreferences {
  preferredFacetKeys: string[];
  /** Higher = more price-sensitive. */
  priceWeight: number;
}

export interface VectorSearchParams {
  /** Embedding dimension (must match DB column). */
  dimensions: number;
  /** Schema-qualified table name for SQL fragments. */
  tableName: string;
  /** Number of neighbors to retrieve before filtering. */
  efSearch: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

function hashEmbedding(productId: string, dim: number): number[] {
  const out = new Array<number>(dim).fill(0);
  for (let i = 0; i < productId.length; i++) {
    const slot = (productId.charCodeAt(i) * (i + 11)) % dim;
    out[slot] = (out[slot] ?? 0) + (productId.charCodeAt(i) % 17) / 100;
  }
  const norm = Math.sqrt(out.reduce((s, x) => s + x * x, 0)) || 1;
  return out.map((x) => x / norm);
}

/**
 * Similarity search interface for pgvector (parameterized SQL; execute in your data layer).
 */
export function buildPgvectorKnnQuery(params: VectorSearchParams): string {
  return `
    SELECT product_id, 1 - (embedding <=> $1::vector) AS similarity
    FROM ${params.tableName}
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT ${params.efSearch};
  `.trim();
}

/**
 * Retrieves similar and alternative products using embeddings and rule filters.
 */
export class ProductRetrievalService {
  constructor(private readonly vectorParams: VectorSearchParams) {}

  /**
   * @param product - Anchor product.
   * @param catalog - Candidate catalog slice (in-memory stand-in for DB result).
   * @param filters - Hard filters.
   * @param preferences - Soft reranking preferences.
   */
  findSimilarProducts(
    product: Product,
    catalog: Product[],
    filters: RetrievalFilters,
    preferences: ShopperPreferences,
  ): Product[] {
    const emb = hashEmbedding(product.productId, this.vectorParams.dimensions);
    const scored = catalog
      .filter((p) => this.applyHardFilters(p, filters))
      .map((p) => ({
        p,
        sim: cosineSimilarity(emb, hashEmbedding(p.productId, this.vectorParams.dimensions)),
      }))
      .sort((a, b) => b.sim - a.sim);
    return this.rerankByPreferences(
      scored.map((s) => s.p),
      product,
      preferences,
    );
  }

  /**
   * Surfaces alternatives that mitigate known risk factors (e.g., sizing, fragility).
   */
  findAlternatives(
    product: Product,
    catalog: Product[],
    riskFactors: string[],
    filters: RetrievalFilters,
    preferences: ShopperPreferences,
  ): Product[] {
    const riskSet = new Set(riskFactors.map((r) => r.toLowerCase()));
    const emb = hashEmbedding(product.productId, this.vectorParams.dimensions);

    const scored = catalog
      .filter((p) => p.productId !== product.productId)
      .filter((p) => this.applyHardFilters(p, filters))
      .map((p) => {
        const sim = cosineSimilarity(emb, hashEmbedding(p.productId, this.vectorParams.dimensions));
        const mitigates = this.riskMitigationScore(p, riskSet);
        const combined = 0.62 * sim + 0.38 * mitigates;
        return { p, combined };
      })
      .sort((a, b) => b.combined - a.combined);

    return this.rerankByPreferences(
      scored.map((s) => s.p),
      product,
      preferences,
    );
  }

  private applyHardFilters(p: Product, f: RetrievalFilters): boolean {
    if (f.tenantId && p.tenantId !== f.tenantId) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.excludeProductIds?.includes(p.productId)) return false;
    return true;
  }

  private riskMitigationScore(p: Product, risks: Set<string>): number {
    let s = 0.5;
    const title = `${p.title} ${p.description}`.toLowerCase();
    if (risks.has("size_mismatch") && /true to size|consistent sizing|size chart/i.test(title)) {
      s += 0.25;
    }
    if (risks.has("logistics_damage") && p.variants.some((v) => v.dimensionalShippingClass === "parcel")) {
      s += 0.15;
    }
    if (risks.has("quality_perception") && p.contentQualityScore > 0.72) {
      s += 0.12;
    }
    return Math.min(1, s);
  }

  private rerankByPreferences(
    ordered: Product[],
    anchor: Product,
    preferences: ShopperPreferences,
  ): Product[] {
    const anchorFacets = new Set(anchor.searchFacetKeys);
    const wPrice = preferences.priceWeight;
    return [...ordered]
      .map((p) => {
        const prefHits = preferences.preferredFacetKeys.filter((k) => p.searchFacetKeys.includes(k))
          .length;
        const facetJacc = this.jaccard(anchorFacets, new Set(p.searchFacetKeys));
        const score =
          (1 - wPrice) * (0.55 + 0.45 * facetJacc) +
          wPrice * (0.2 + 0.8 * (prefHits / Math.max(1, preferences.preferredFacetKeys.length || 1)));
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);
  }

  private jaccard(a: Set<string>, b: Set<string>): number {
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    const union = a.size + b.size - inter;
    return union === 0 ? 0 : inter / union;
  }
}
