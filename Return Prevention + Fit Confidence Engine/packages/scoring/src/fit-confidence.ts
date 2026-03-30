/**
 * Category-aware fit confidence scoring with between-size distributions and uncertainty.
 */

import type { Product, ProductCategory } from "@return-prevention/types";
import { ConfidenceLevel } from "@return-prevention/types";

/** Aggregated review/community signals for fit modeling. */
export interface ReviewSignals {
  /** Mass on "runs small" vs chart (roughly [-1, 1]). */
  runsSmallBias: number;
  /** Mass on "runs large". */
  runsLargeBias: number;
  /** Footwear: narrow/wide mentions normalized [-1, 1]. */
  widthBias: number;
  /** Generic comfort score [0, 1]. */
  comfortScore: number;
  /** Sample size backing the aggregates. */
  reviewCount: number;
  /** Per-signal confidence [0, 1]. */
  signalConfidence: number;
}

/** Session or long-term memory influencing priors. */
export interface MemoryState {
  /** Prior successful size tokens in this category. */
  preferredSizeTokens: string[];
  /** Explicit fit intent: slim | regular | relaxed. */
  fitIntent?: "slim" | "regular" | "relaxed";
  /** Decayed affinity for brand fit (higher = trust brand chart). */
  brandChartTrust: number;
}

/** Shopper context for measurement alignment. */
export interface UserFitContext {
  /** Canonical measurement keys → values in declared units. */
  bodyMeasurements: Record<string, number>;
  /** Unit per key (e.g. chest_cm). */
  measurementUnits: Record<string, string>;
  /** Stated tolerance for tight vs loose (0=tight, 1=loose). */
  fitLoosenessPreference: number;
}

/** One discrete size option with optional numeric proxy for distance. */
export interface SizeOption {
  label: string;
  /** Primary numeric size index for ordering (e.g. numeric waist). */
  ordinal: number;
  /** Chart row key if known. */
  rowKey?: string;
}

/** Output of fit confidence computation. */
export interface FitConfidenceResult {
  /** Composite fit quality ∈ [0, 1]. */
  score: number;
  confidenceLevel: ConfidenceLevel;
  /** Categorical dimension scores ∈ [0, 1]. */
  dimensionScores: Record<string, number>;
  /** Between-size probability mass over candidate labels. */
  betweenSizeDistribution: Record<string, number>;
  /** Normalized entropy of between-size distribution ∈ [0, 1]. */
  structuralUncertainty: number;
  /** Epistemic uncertainty from sparse/conflicting evidence ∈ [0, 1]. */
  epistemicUncertainty: number;
  /** Combined uncertainty for UI gating ∈ [0, 1]. */
  totalUncertainty: number;
  /** Human-readable drivers. */
  rationale: string[];
}

const CATEGORY_DIMENSION_WEIGHTS: Record<
  ProductCategory,
  Record<string, number>
> = {
  apparel: { body: 0.45, silhouette: 0.25, comfort: 0.2, misc: 0.1 },
  footwear: { tts: 0.35, width: 0.25, arch: 0.15, comfort: 0.15, misc: 0.1 },
  furniture: { room_fit: 0.4, lifestyle: 0.25, comfort: 0.2, misc: 0.15 },
  beauty: { sensitivity: 0.55, texture: 0.2, shade: 0.15, misc: 0.1 },
  travel_gear: { portability: 0.35, durability: 0.25, comfort: 0.2, misc: 0.2 },
  home_goods: { room_fit: 0.3, maintenance: 0.25, quality: 0.25, misc: 0.2 },
  accessories: { body: 0.3, style: 0.3, comfort: 0.25, misc: 0.15 },
  electronics: { use_case: 0.4, ergonomics: 0.3, quality: 0.2, misc: 0.1 },
};

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}

function entropyNormalized(probs: number[]): number {
  const p = probs.filter((x) => x > 1e-12);
  if (p.length <= 1) return 0;
  let h = 0;
  for (const x of p) h -= x * Math.log(x);
  const hMax = Math.log(p.length);
  return hMax > 0 ? h / hMax : 0;
}

/**
 * Computes fit confidence using weighted evidence aggregation, category-specific
 * dimensions, between-size softmax, and uncertainty decomposition.
 */
export class FitConfidenceScorer {
  /**
   * @param product - Catalog product with category and attributes.
   * @param userContext - Measurements and fit preference.
   * @param reviewSignals - Aggregated review intelligence.
   * @param memoryState - Prior preferences and brand trust.
   * @returns Calibrated fit result with uncertainty.
   */
  computeFitConfidence(
    product: Product,
    userContext: UserFitContext,
    reviewSignals: ReviewSignals,
    memoryState: MemoryState,
  ): FitConfidenceResult {
    const cat = product.category;
    const weights = CATEGORY_DIMENSION_WEIGHTS[cat] ?? CATEGORY_DIMENSION_WEIGHTS.apparel;

    const biasNet = reviewSignals.runsLargeBias - reviewSignals.runsSmallBias;
    const reviewAgreement = clamp01(1 - Math.abs(biasNet) * 0.35);

    const bodyAlign = this.bodyAlignmentScore(product, userContext, memoryState);
    const silhouette = clamp01(0.75 + 0.15 * Math.sin(userContext.fitLoosenessPreference * Math.PI));
    const comfortDim = clamp01(
      0.55 * reviewSignals.comfortScore + 0.45 * reviewAgreement,
    );

    const dimMap: Record<string, number> = {
      body: bodyAlign,
      silhouette,
      comfort: comfortDim,
      tts: clamp01(bodyAlign + 0.05 * biasNet),
      width: clamp01(0.5 + 0.5 * (1 - Math.abs(reviewSignals.widthBias))),
      arch: clamp01(0.62 + 0.08 * reviewSignals.signalConfidence),
      room_fit: clamp01(0.7 + 0.1 * userContext.fitLoosenessPreference),
      lifestyle: clamp01(0.65 + 0.1 * memoryState.brandChartTrust),
      sensitivity: clamp01(0.72 - 0.15 * Math.max(0, -biasNet)),
      texture: comfortDim,
      shade: 0.68,
      portability: clamp01(0.68 + 0.06 * reviewSignals.comfortScore),
      durability: clamp01(0.7 * reviewSignals.signalConfidence + 0.3 * reviewAgreement),
      maintenance: comfortDim,
      quality: reviewSignals.signalConfidence,
      style: silhouette,
      use_case: clamp01(0.7 + 0.05 * memoryState.brandChartTrust),
      ergonomics: comfortDim,
      misc: clamp01(0.5 * bodyAlign + 0.5 * reviewSignals.signalConfidence),
    };

    let num = 0;
    let den = 0;
    const rationale: string[] = [];
    for (const [k, w] of Object.entries(weights)) {
      const v = dimMap[k] ?? dimMap.misc ?? 0.5;
      num += w * v;
      den += w;
      if (w >= 0.2) rationale.push(`${k}:${v.toFixed(2)}`);
    }
    const score = den > 0 ? clamp01(num / den) : 0.5;

    const candidates = this.inferSizeCandidates(product, userContext, reviewSignals);
    const dist = this.betweenSizeDistribution(candidates, userContext, reviewSignals);
    const structuralUncertainty = entropyNormalized(Object.values(dist));

    const evidenceStrength = clamp01(
      Math.log1p(reviewSignals.reviewCount) / Math.log1p(50),
    );
    const conflict = clamp01(Math.abs(reviewSignals.runsSmallBias - reviewSignals.runsLargeBias));
    const epistemicUncertainty = clamp01(
      0.35 * (1 - evidenceStrength) + 0.35 * conflict + 0.3 * (1 - reviewSignals.signalConfidence),
    );

    const totalUncertainty = clamp01(
      0.55 * structuralUncertainty + 0.45 * epistemicUncertainty,
    );

    const confidenceLevel = this.mapConfidence(score, totalUncertainty);

    return {
      score,
      confidenceLevel,
      dimensionScores: Object.fromEntries(
        Object.keys(weights).map((k) => [k, dimMap[k] ?? dimMap.misc!]),
      ),
      betweenSizeDistribution: dist,
      structuralUncertainty,
      epistemicUncertainty,
      totalUncertainty,
      rationale,
    };
  }

  private mapConfidence(score: number, uncertainty: number): ConfidenceLevel {
    const adj = score * (1 - 0.5 * uncertainty);
    if (adj >= 0.82 && uncertainty < 0.28) return ConfidenceLevel.VeryHigh;
    if (adj >= 0.68 && uncertainty < 0.42) return ConfidenceLevel.High;
    if (adj >= 0.52 && uncertainty < 0.58) return ConfidenceLevel.Medium;
    if (adj >= 0.38) return ConfidenceLevel.Low;
    return ConfidenceLevel.VeryLow;
  }

  private bodyAlignmentScore(
    product: Product,
    ctx: UserFitContext,
    memory: MemoryState,
  ): number {
    const chart = product.sizeCharts[0];
    if (!chart) return clamp01(0.55 + 0.15 * memory.brandChartTrust);

    const region = Object.keys(chart.rowsByRegion)[0];
    const rows = chart.rowsByRegion[region] ?? [];
    if (rows.length === 0) return 0.55;

    let best = 0;
    for (const row of rows) {
      let sse = 0;
      let n = 0;
      for (const [col, val] of Object.entries(row.measurements)) {
        const userVal = ctx.bodyMeasurements[col];
        if (userVal === undefined) continue;
        const d = (val - userVal) / (Math.abs(val) + 1e-6);
        sse += d * d;
        n++;
      }
      if (n === 0) continue;
      const rmse = Math.sqrt(sse / n);
      const rowScore = Math.exp(-4.5 * rmse);
      best = Math.max(best, rowScore);
    }
    return clamp01(0.4 + 0.55 * best + 0.05 * memory.brandChartTrust);
  }

  private inferSizeCandidates(
    product: Product,
    ctx: UserFitContext,
    _signals: ReviewSignals,
  ): SizeOption[] {
    const chart = product.sizeCharts[0];
    if (!chart) {
      return product.variants.slice(0, 8).map((v, i) => ({
        label: v.sku,
        ordinal: i,
        rowKey: v.sku,
      }));
    }
    const region = Object.keys(chart.rowsByRegion)[0];
    const rows = chart.rowsByRegion[region] ?? [];
    return rows.map((r, idx) => ({
      label: r.regionLabel,
      ordinal: idx + ctx.fitLoosenessPreference * 0.15,
      rowKey: r.rowKey,
    }));
  }

  /**
   * Softmax over sizes using squared distance to user measurements plus review bias.
   */
  private betweenSizeDistribution(
    candidates: SizeOption[],
    ctx: UserFitContext,
    signals: ReviewSignals,
  ): Record<string, number> {
    if (candidates.length === 0) return { unknown: 1 };

    const beta = 1.85;
    const logits: number[] = [];
    for (const c of candidates) {
      const proxy =
        typeof c.ordinal === "number"
          ? c.ordinal
          : parseFloat(String(c.ordinal)) || 0;
      const target =
        3 +
        4 * ctx.fitLoosenessPreference +
        0.4 * (signals.runsLargeBias - signals.runsSmallBias);
      const dist = (proxy - target) ** 2;
      logits.push(-beta * dist);
    }
    const probs = softmax(logits);
    const out: Record<string, number> = {};
    candidates.forEach((c, i) => {
      const key = c.label || `opt_${i}`;
      out[key] = probs[i] ?? 0;
    });
    return out;
  }
}
