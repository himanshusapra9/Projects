/**
 * Multi-criteria alternative ranking with diversity-aware re-ranking.
 */

import type { Product } from "@return-prevention/types";
import { ConfidenceLevel } from "@return-prevention/types";

export interface UserAltContext {
  /** Max acceptable price in minor units (same currency as candidates). */
  maxPriceMinor?: number;
  /** Preferred attribute tokens for soft matching. */
  preferredFacetKeys: string[];
  /** Weight on price vs fit (0 = ignore price, 1 = price dominant). */
  priceSensitivity: number;
}

export interface RankedAlternative {
  product: Product;
  /** Linear utility used for ordering. */
  utility: number;
  components: {
    fit: number;
    risk: number;
    price: number;
    preference: number;
    diversity: number;
  };
  rankConfidence: ConfidenceLevel;
  reasonToken: string;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Ranks substitute products using weighted utility and diversity penalties.
 */
export class AlternativeRanker {
  /**
   * @param currentProduct - Product shopper is viewing.
   * @param candidates - Feasible alternatives with precomputed scores.
   * @param userContext - Price and preference constraints.
   * @param fitScores - Map productId → fit confidence.
   * @param riskScores - Map productId → return risk probability.
   */
  rankAlternatives(
    currentProduct: Product,
    candidates: Product[],
    userContext: UserAltContext,
    fitScores: Record<string, number>,
    riskScores: Record<string, number>,
  ): RankedAlternative[] {
    const refFacets = new Set(currentProduct.searchFacetKeys);
    const refTitleTokens = new Set(
      currentProduct.title.toLowerCase().split(/\W+/).filter((t) => t.length > 2),
    );

    const baseRows: Array<{
      product: Product;
      baseUtility: number;
      components: RankedAlternative["components"];
    }> = [];

    for (const p of candidates) {
      if (p.productId === currentProduct.productId) continue;

      const fit = clamp01(fitScores[p.productId] ?? 0.5);
      const risk = clamp01(riskScores[p.productId] ?? 0.35);
      const price = this.priceScore(p, userContext);
      const pref = this.preferenceScore(p, userContext, refFacets, refTitleTokens);

      const wFit = 0.42;
      const wRisk = 0.28;
      const wPrice = 0.18 + 0.12 * userContext.priceSensitivity;
      const wPref = 0.12;

      const baseUtility =
        wFit * fit + wRisk * (1 - risk) + wPrice * price + wPref * pref;

      baseRows.push({
        product: p,
        baseUtility,
        components: {
          fit,
          risk: 1 - risk,
          price,
          preference: pref,
          diversity: 0,
        },
      });
    }

    baseRows.sort((a, b) => b.baseUtility - a.baseUtility);

    const selected: Array<{
      product: Product;
      utility: number;
      components: RankedAlternative["components"];
    }> = [];
    const selectedFacetSets: Array<Set<string>> = [];

    const lambda = 0.22;
    const pool = [...baseRows];

    while (pool.length > 0 && selected.length < 8) {
      let bestIdx = 0;
      let bestScore = -Infinity;
      for (let i = 0; i < pool.length; i++) {
        const row = pool[i]!;
        const facets = new Set(row.product.searchFacetKeys);
        const maxSim =
          selectedFacetSets.length === 0
            ? 0
            : Math.max(...selectedFacetSets.map((s) => jaccard(facets, s)));
        const diversity = clamp01(1 - maxSim);
        const penalized = row.baseUtility + lambda * diversity;
        if (penalized > bestScore) {
          bestScore = penalized;
          bestIdx = i;
        }
      }
      const chosen = pool.splice(bestIdx, 1)[0]!;
      const facets = new Set(chosen.product.searchFacetKeys);
      const maxSim =
        selectedFacetSets.length === 0
          ? 0
          : Math.max(...selectedFacetSets.map((s) => jaccard(facets, s)));
      const diversity = clamp01(1 - maxSim);
      chosen.components.diversity = diversity;
      const utility = chosen.baseUtility + lambda * diversity;
      selected.push({ product: chosen.product, utility, components: chosen.components });
      selectedFacetSets.push(facets);
    }

    selected.sort((a, b) => b.utility - a.utility);

    return selected.map((s, idx) => ({
      product: s.product,
      utility: s.utility,
      components: s.components,
      rankConfidence: this.confidenceFromSpread(selected, idx),
      reasonToken:
        s.components.fit >= s.components.risk && s.components.fit >= s.components.price
          ? "fit_led"
          : s.components.risk >= s.components.fit
            ? "risk_mitigation"
            : "value_led",
    }));
  }

  private priceScore(p: Product, ctx: UserAltContext): number {
    const effective = this.syntheticEffectivePriceMinor(p);
    const max = ctx.maxPriceMinor ?? effective * 1.35;
    if (max <= 0) return 0.5;
    return clamp01(1 - Math.min(1, effective / max));
  }

  /** Deterministic stand-in when catalog prices are not wired; swap for list/sale minor units. */
  private syntheticEffectivePriceMinor(p: Product): number {
    let h = 2166136261;
    for (const c of p.productId) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const w = p.variants.reduce((acc, v) => acc + (v.weightGrams ?? 100), 0);
    return 1500 + (Math.abs(h) % 22000) + Math.min(4000, Math.floor(w / 10));
  }

  private preferenceScore(
    p: Product,
    ctx: UserAltContext,
    refFacets: Set<string>,
    refTokens: Set<string>,
  ): number {
    const prefHit = ctx.preferredFacetKeys.filter((k) => p.searchFacetKeys.includes(k)).length;
    const prefPart = prefHit / Math.max(1, ctx.preferredFacetKeys.length || 1);

    const facetSim = jaccard(refFacets, new Set(p.searchFacetKeys));
    const titleTokens = new Set(
      p.title.toLowerCase().split(/\W+/).filter((t) => t.length > 2),
    );
    const titleSim = jaccard(refTokens, titleTokens);

    return clamp01(0.45 * prefPart + 0.35 * facetSim + 0.2 * titleSim);
  }

  private confidenceFromSpread(
    rows: Array<{ utility: number }>,
    idx: number,
  ): ConfidenceLevel {
    const top = rows[0]?.utility ?? 0;
    const cur = rows[idx]?.utility ?? 0;
    const gap = top - cur;
    if (idx === 0 && gap < 0.02) return ConfidenceLevel.Medium;
    if (gap < 0.04) return ConfidenceLevel.Medium;
    if (gap < 0.1) return ConfidenceLevel.High;
    return ConfidenceLevel.VeryHigh;
  }
}
