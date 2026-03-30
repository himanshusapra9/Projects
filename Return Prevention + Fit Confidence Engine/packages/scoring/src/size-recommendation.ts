/**
 * Size recommendation with chart alignment, between-size interpolation, and review deltas.
 */

import type { Product, SizeChart } from "@return-prevention/types";
import { ProductCategory } from "@return-prevention/types";

export interface UserMeasurements {
  /** Column id → numeric value in chart units. */
  values: Record<string, number>;
}

export interface UserSizePreferences {
  /** -1 slim, 0 regular, 1 relaxed (maps to chart fitIntent / looseness). */
  fitStyle: number;
  /** Brand-specific offset in abstract size index units. */
  brandAdjustmentIndex: number;
}

export interface ReviewFitSignals {
  /** Negative = runs small, positive = runs large in index units. */
  runsSmallLargeDelta: number;
  /** Confidence in review-derived delta ∈ [0, 1]. */
  confidence: number;
}

export interface SizeRecommendationResult {
  recommendedLabel: string;
  recommendedRowKey: string;
  /** Soft distribution over neighboring sizes for UX. */
  neighborDistribution: Record<string, number>;
  /** Primary axis alignment score ∈ [0, 1]. */
  alignmentScore: number;
  /** Notes for CX when between two chart rows. */
  interpolationNotes: string;
  /** Whether user fit style pushed across a boundary. */
  conflictWithChartDefault: boolean;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function softmax(logits: number[]): number[] {
  const m = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}

/**
 * Recommends a size using measurement distance, fit-style preference, brand offsets, and reviews.
 */
export class SizeRecommender {
  /**
   * @param product - Product with size charts.
   * @param sizeChart - Chart to use (typically product.sizeCharts[0]).
   * @param userMeasurements - Shopper measurements keyed to chart columns.
   * @param userPreferences - Fit style and brand adjustments.
   * @param reviewFitSignals - Community "runs small/large" offset.
   */
  recommendSize(
    product: Product,
    sizeChart: SizeChart,
    userMeasurements: UserMeasurements,
    userPreferences: UserSizePreferences,
    reviewFitSignals: ReviewFitSignals,
  ): SizeRecommendationResult {
    const region = this.pickRegion(sizeChart);
    const rows = sizeChart.rowsByRegion[region] ?? [];
    if (rows.length === 0) {
      return {
        recommendedLabel: product.defaultVariantSku ?? "UNKNOWN",
        recommendedRowKey: "none",
        neighborDistribution: { unknown: 1 },
        alignmentScore: 0.35,
        interpolationNotes: "No chart rows for region; fall back to default variant.",
        conflictWithChartDefault: true,
      };
    }

    const brandKey = sizeChart.brandKey;
    const brandNudge =
      userPreferences.brandAdjustmentIndex * 0.08 +
      this.categoryBrandPrior(product.category, brandKey);

    const reviewShift =
      reviewFitSignals.runsSmallLargeDelta * (0.35 + 0.65 * reviewFitSignals.confidence);

    const looseness = clamp(userPreferences.fitStyle, -1, 1);
    const styleBias = 0.22 * looseness;

    const logits: number[] = [];
    const labels: string[] = [];
    const keys: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      let sse = 0;
      let n = 0;
      for (const [colId, chartVal] of Object.entries(row.measurements)) {
        const userVal = userMeasurements.values[colId];
        if (userVal === undefined) continue;
        const scale = Math.abs(chartVal) + 1e-6;
        const residual = (chartVal - userVal) / scale;
        sse += residual * residual;
        n++;
      }
      const rmse = n > 0 ? Math.sqrt(sse / n) : 0.75;
      const distancePenalty = -3.2 * rmse;
      const order = i + styleBias + brandNudge + reviewShift;
      const orderPenalty = -0.18 * (order - rows.length / 2) ** 2 * 0.01;
      logits.push(distancePenalty + orderPenalty);
      labels.push(row.regionLabel);
      keys.push(row.rowKey);
    }

    const probs = softmax(logits);
    let bestIdx = 0;
    let bestP = probs[0] ?? 0;
    for (let i = 1; i < probs.length; i++) {
      if ((probs[i] ?? 0) > bestP) {
        bestP = probs[i]!;
        bestIdx = i;
      }
    }

    const neighborDistribution: Record<string, number> = {};
    labels.forEach((l, i) => {
      neighborDistribution[l] = probs[i] ?? 0;
    });

    const bestRmse = this.rowRmse(rows[bestIdx]!, userMeasurements.values);
    const alignmentScore = clamp(1 / (1 + 3.8 * bestRmse), 0, 1);

    const runnerUp = probs
      .map((p, i) => ({ p: p ?? 0, i }))
      .sort((a, b) => b.p - a.p)[1];
    const ambiguous =
      runnerUp && bestP > 0 && runnerUp.p / bestP > 0.55 && Math.abs(bestIdx - runnerUp.i) === 1;

    const interpolationNotes = ambiguous
      ? `Measurements fall between ${labels[bestIdx]} and ${labels[runnerUp!.i]}; preference leaned ${
          looseness < -0.2 ? "slim" : looseness > 0.2 ? "relaxed" : "neutral"
        }.`
      : `Best chart row ${labels[bestIdx]} with RMSE ${bestRmse.toFixed(3)}.`;

    const conflictWithChartDefault =
      Math.abs(styleBias) > 0.25 && alignmentScore < 0.62;

    return {
      recommendedLabel: labels[bestIdx]!,
      recommendedRowKey: keys[bestIdx]!,
      neighborDistribution,
      alignmentScore,
      interpolationNotes,
      conflictWithChartDefault,
    };
  }

  private pickRegion(chart: SizeChart): string {
    const keys = Object.keys(chart.rowsByRegion);
    return keys.includes("US") ? "US" : keys[0] ?? "US";
  }

  private rowRmse(
    row: { measurements: Record<string, number> },
    userVals: Record<string, number>,
  ): number {
    let sse = 0;
    let n = 0;
    for (const [k, v] of Object.entries(row.measurements)) {
      const u = userVals[k];
      if (u === undefined) continue;
      const scale = Math.abs(v) + 1e-6;
      const r = (v - u) / scale;
      sse += r * r;
      n++;
    }
    return n > 0 ? Math.sqrt(sse / n) : 1;
  }

  private categoryBrandPrior(category: ProductCategory, brandKey: string): number {
    const h = Array.from(brandKey).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const jitter = (h % 17) / 170 - 0.05;
    if (category === ProductCategory.Footwear) return 0.06 + jitter;
    if (category === ProductCategory.Apparel) return -0.02 + jitter;
    return 0 + jitter;
  }
}
