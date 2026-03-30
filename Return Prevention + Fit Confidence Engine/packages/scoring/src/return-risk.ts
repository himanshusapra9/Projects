/**
 * Return risk scoring with multi-reason decomposition, interventions, and mitigation text.
 */

import type { Product } from "@return-prevention/types";
import {
  ConfidenceLevel,
  RiskLevel,
  type ReturnRiskScore,
} from "@return-prevention/types";
import { ReturnReason, type ReturnEvent } from "@return-prevention/types";

/** Extended factor keys beyond enum for fine-grained decomposition (15+). */
export type ReturnRiskFactorId =
  | "size_mismatch"
  | "width_mismatch"
  | "color_expectation"
  | "material_feel"
  | "quality_perception"
  | "style_expectation"
  | "comfort_break_in"
  | "assembly_friction"
  | "maintenance_burden"
  | "use_case_mismatch"
  | "logistics_damage"
  | "value_price_gap"
  | "promo_regret"
  | "impulse_purchase"
  | "gift_mismatch"
  | "defect_likelihood"
  | "category_fragility"
  | "data_sparsity";

export interface ReviewRiskSignals {
  negativeSentiment: number;
  qualityComplaints: number;
  colorAccuracyIssues: number;
  comfortIssues: number;
}

export interface UserRiskContext {
  /** Historical return rate for this user ∈ [0, 1]. */
  userReturnRate: number;
  /** Promo depth on line item (0 none, 1 deep discount). */
  promoDepth: number;
  /** Basket novelty (0 familiar categories, 1 all new). */
  categoryNovelty: number;
}

export interface ReturnRiskResult {
  /** Scalar risk ∈ [0, 1]. */
  probability: number;
  riskLevel: RiskLevel;
  estimateConfidence: ConfidenceLevel;
  /** Non-negative weights over factor ids (sum ≈ 1). */
  factorDecomposition: Record<ReturnRiskFactorId, number>;
  /** Whether operational intervention is recommended. */
  interventionRecommended: boolean;
  /** Threshold used (calibrated). */
  interventionThreshold: number;
  /** Top preventable drivers with mass. */
  preventableDrivers: Array<{ factorId: ReturnRiskFactorId; mass: number }>;
  /** Merchant-facing suggestions. */
  mitigationSuggestions: string[];
  /** Structured score compatible with analytics layer. */
  scorecard: ReturnRiskScore;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function logit(p: number): number {
  const pp = clamp01(p);
  const eps = 1e-9;
  return Math.log((pp + eps) / (1 - pp + eps));
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Computes calibrated return risk with 17-way factor decomposition and policy hooks.
 */
export class ReturnRiskScorer {
  private readonly interventionThreshold = 0.34;

  /**
   * @param product - Product being evaluated.
   * @param userContext - Shopper risk context.
   * @param historicalReturns - Recent returns for SKU/category.
   * @param reviewSignals - Negative experience signals from reviews.
   */
  computeReturnRisk(
    product: Product,
    userContext: UserRiskContext,
    historicalReturns: ReturnEvent[],
    reviewSignals: ReviewRiskSignals,
  ): ReturnRiskResult {
    const cat = product.category;
    const contentQ = clamp01(product.contentQualityScore);

    const skuReturns = historicalReturns.filter((r) => r.productId === product.productId);
    const catReturns = historicalReturns.filter((r) => r.productCategory === cat);

    const skuRate =
      skuReturns.length > 0
        ? skuReturns.filter((r) => r.deemedPreventable).length / skuReturns.length
        : 0.12;
    const catRate =
      catReturns.length > 0
        ? catReturns.length / Math.max(8, catReturns.length + 20)
        : 0.18;

    const reasonHistogram: Partial<Record<ReturnReason, number>> = {};
    for (const r of skuReturns) {
      reasonHistogram[r.reason] = (reasonHistogram[r.reason] ?? 0) + 1;
    }
    const totalR = skuReturns.length || 1;
    const pSize =
      ((reasonHistogram[ReturnReason.SizeTooSmall] ?? 0) +
        (reasonHistogram[ReturnReason.SizeTooLarge] ?? 0)) /
      totalR;
    const pQuality = (reasonHistogram[ReturnReason.QualityMismatch] ?? 0) / totalR;
    const pColor = (reasonHistogram[ReturnReason.ColorMismatch] ?? 0) / totalR;

    const priors = product.categoryProfile.returnReasonPriors;
    const priorVec = Object.values(priors);
    const priorMean = priorVec.length
      ? priorVec.reduce((a, b) => a + b, 0) / priorVec.length
      : 0.15;

    const baseLogit =
      -1.15 +
      1.25 * logit(clamp01(0.08 + 0.65 * userContext.userReturnRate + 0.35 * priorMean)) +
      0.9 * logit(clamp01(0.1 + 0.75 * skuRate + 0.25 * catRate)) +
      0.45 * reviewSignals.negativeSentiment +
      0.35 * reviewSignals.qualityComplaints +
      0.25 * reviewSignals.colorAccuracyIssues +
      0.3 * reviewSignals.comfortIssues -
      0.55 * contentQ -
      0.15 * userContext.categoryNovelty +
      0.4 * userContext.promoDepth +
      (cat === "furniture" ? 0.22 : 0) +
      (cat === "beauty" ? 0.12 : 0);

    const raw = sigmoid(baseLogit);
    const logisticsRiskModifier = cat === "furniture" || cat === "home_goods" ? 0.08 : 0.03;
    const probability = clamp01(raw + logisticsRiskModifier * 0.25);

    const fragilityBoost = cat === "furniture" || cat === "travel_gear";
    const factors: Record<ReturnRiskFactorId, number> = {
      size_mismatch: clamp01(0.22 + 0.55 * pSize + 0.1 * skuRate),
      width_mismatch: clamp01(
        0.05 + (0.35 * (reasonHistogram[ReturnReason.ComfortMismatch] ?? 0)) / totalR,
      ),
      color_expectation: clamp01(0.08 + 0.65 * pColor),
      material_feel: clamp01(0.1 + 0.45 * reviewSignals.comfortIssues),
      quality_perception: clamp01(0.12 + 0.55 * pQuality + 0.35 * reviewSignals.qualityComplaints),
      style_expectation: clamp01(
        0.08 + (0.25 * (reasonHistogram[ReturnReason.StyleMismatch] ?? 0)) / totalR,
      ),
      comfort_break_in: clamp01(0.1 + 0.4 * reviewSignals.comfortIssues),
      assembly_friction: clamp01(0.06 + (cat === "furniture" ? 0.35 : 0.05)),
      maintenance_burden: clamp01(0.05 + (cat === "home_goods" ? 0.2 : 0.04)),
      use_case_mismatch: clamp01(0.07 + 0.35 * userContext.categoryNovelty),
      logistics_damage: clamp01(0.04 + (fragilityBoost ? 0.18 : 0.05)),
      value_price_gap: clamp01(0.1 + 0.45 * userContext.promoDepth),
      promo_regret: clamp01(0.08 + 0.5 * userContext.promoDepth),
      impulse_purchase: clamp01(0.06 + 0.35 * userContext.promoDepth * userContext.categoryNovelty),
      gift_mismatch: 0.05,
      defect_likelihood: clamp01(0.04 + 0.35 * pQuality),
      category_fragility: fragilityBoost ? 0.18 : 0.06,
      data_sparsity: clamp01(0.12 + 0.55 * (1 - contentQ)),
    };

    const sum = Object.values(factors).reduce((a, b) => a + b, 0) || 1;
    const factorDecomposition = Object.fromEntries(
      Object.entries(factors).map(([k, v]) => [k, v / sum]),
    ) as Record<ReturnRiskFactorId, number>;

    const estimateConfidence = this.calibrateConfidence(skuReturns.length, contentQ);
    const riskLevel = this.toRiskLevel(probability);

    const preventable = Object.entries(factorDecomposition)
      .filter(([id]) =>
        ["size_mismatch", "width_mismatch", "color_expectation", "use_case_mismatch"].includes(id),
      )
      .map(([factorId, mass]) => ({ factorId: factorId as ReturnRiskFactorId, mass }))
      .sort((a, b) => b.mass - a.mass)
      .slice(0, 3);

    const interventionRecommended = probability >= this.interventionThreshold;

    const mitigationSuggestions = this.buildMitigations(preventable, cat, probability);

    const scorecard: ReturnRiskScore = {
      probability,
      riskLevel,
      estimateConfidence,
      topContributors: preventable.map((p) => p.factorId),
      logisticsRiskModifier,
      valueGapSensitivity: clamp01(0.25 + userContext.promoDepth),
      cohortSimilarity: clamp01(1 - userContext.categoryNovelty),
      categoryFragilityBoost: fragilityBoost,
      computedAt: new Date().toISOString(),
      dominantPreventableCategoryId: preventable[0]?.factorId,
    };

    return {
      probability,
      riskLevel,
      estimateConfidence,
      factorDecomposition,
      interventionRecommended,
      interventionThreshold: this.interventionThreshold,
      preventableDrivers: preventable,
      mitigationSuggestions,
      scorecard,
    };
  }

  private calibrateConfidence(n: number, contentQ: number): ConfidenceLevel {
    const dataStrength = clamp01((Math.log1p(n) / Math.log1p(24)) * contentQ);
    if (dataStrength >= 0.72) return ConfidenceLevel.High;
    if (dataStrength >= 0.45) return ConfidenceLevel.Medium;
    if (dataStrength >= 0.22) return ConfidenceLevel.Low;
    return ConfidenceLevel.VeryLow;
  }

  private toRiskLevel(p: number): RiskLevel {
    if (p < 0.12) return RiskLevel.Negligible;
    if (p < 0.2) return RiskLevel.Low;
    if (p < 0.3) return RiskLevel.Moderate;
    if (p < 0.42) return RiskLevel.Elevated;
    if (p < 0.58) return RiskLevel.High;
    return RiskLevel.Critical;
  }

  private buildMitigations(
    drivers: Array<{ factorId: ReturnRiskFactorId; mass: number }>,
    cat: Product["category"],
    p: number,
  ): string[] {
    const out: string[] = [];
    const top = drivers[0]?.factorId;
    if (top === "size_mismatch") {
      out.push("Show interactive size guidance and brand-specific measurement mapping.");
    }
    if (top === "color_expectation") {
      out.push("Surface true-to-life imagery and color calibration notes for lighting.");
    }
    if (top === "use_case_mismatch") {
      out.push("Ask one clarifying question on intended use before add-to-cart.");
    }
    if (cat === "furniture" && p > 0.28) {
      out.push("Offer room-dimension checklist and delivery path constraints.");
    }
    if (p > 0.4) {
      out.push("Propose lower-risk alternative SKUs with better historical keep rates.");
    }
    if (out.length === 0) {
      out.push("Use standard PDP education modules; risk is diffuse or data-sparse.");
    }
    return out;
  }
}
