/**
 * Shopper fit profiles, assessments, recommendations, evidence, and measurement
 * dimensions used by the fit confidence engine.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * Known body or usage measurement axis used in models.
 */
export interface FitDimension {
  /** Stable axis key (e.g., "chest_cm", "foot_length_mm"). */
  axisKey: string;
  /** Display name for UIs and explanations. */
  displayName: string;
  /** Unit string for presentation. */
  unit: string;
  /** Whether larger values always imply larger garment/size choice. */
  monotonicWithSize: boolean;
  /** Categories where this axis applies. */
  applicableCategories: ProductCategory[];
  /** Typical measurement error SD used in uncertainty propagation. */
  typicalMeasurementErrorSd: number;
  /** Whether self-report is considered reliable for this axis. */
  selfReportReliability: ConfidenceLevel;
  /** Mapping hints to size chart column ids. */
  preferredChartColumnIds: string[];
  /** Optional min/max plausible human range for validation. */
  plausibleRange?: { min: number; max: number };
  /** Version of axis definition for migrations. */
  schemaVersion: string;
  /** Whether axis is required for high-confidence recommendations. */
  requiredForHighConfidence: boolean;
  /** Correlation hints with other axes (e.g., height vs inseam). */
  correlatedAxisKeys?: string[];
}

/**
 * Structured evidence backing a fit assessment (reviews, measurements, returns).
 */
export interface FitEvidence {
  /** Evidence record identifier. */
  evidenceId: string;
  /** Type discriminator for downstream weighting. */
  evidenceType:
    | "user_measurement"
    | "review_quote"
    | "community_vote"
    | "merchant_annotation"
    | "return_outcome"
    | "virtual_tryon";
  /** Source product or variant id. */
  productId: string;
  /** Variant sku if specific. */
  variantSku?: string;
  /** Raw text or structured payload reference. */
  payloadRef: string;
  /** Extracted sentiment toward fit (-1 to 1). */
  fitSentiment?: number;
  /** Confidence in extraction / labeling. */
  labelConfidence: ConfidenceLevel;
  /** ISO timestamp of evidence creation. */
  observedAt: string;
  /** Language code for NLP features. */
  language: string;
  /** Whether evidence was verified (purchase verified review). */
  verifiedPurchase: boolean;
  /** Weight multiplier after deduplication and spam checks. */
  trustWeight: number;
  /** Tags for dimension alignment (e.g., "runs_small"). */
  semanticTags: string[];
  /** Optional link to community source id. */
  communitySourceId?: string;
}

/**
 * Shopper-level priors and constraints for fit modeling.
 */
export interface FitProfile {
  /** Profile identifier (usually user id). */
  profileId: string;
  /** Measured or inferred body dimensions. */
  bodyDimensions: Record<string, number>;
  /** Self-reported fit preferences (loose vs slim). */
  fitPreferences: Record<string, string>;
  /** Brands the shopper trusts for fit. */
  trustedBrandKeys: string[];
  /** Brands with historically poor fit outcomes. */
  distrustedBrandKeys: string[];
  /** Category-specific adjustments (e.g., +0.5 size in footwear). */
  categoryAdjustments: Partial<Record<ProductCategory, Record<string, number>>>;
  /** Whether profile includes 3D or scan data. */
  hasHighFidelityMeasurements: boolean;
  /** Last update timestamp. */
  updatedAt: string;
  /** Confidence in overall profile completeness. */
  completenessConfidence: ConfidenceLevel;
  /** Sensitivity tags (e.g., sensory issues affecting comfort). */
  comfortSensitivityTags: string[];
  /** Typical layering or undergarment context for apparel. */
  layeringContext?: string;
  /** Activity level for footwear and travel gear. */
  activityLevel?: "low" | "moderate" | "high";
  /** Preferred hem or inseam adjustments. */
  lengthPreferenceNotes?: string;
  /** Shoe width preference if applicable. */
  footwearWidthPreference?: string;
}

/**
 * Model output summarizing expected fit quality for a candidate variant.
 */
export interface FitConfidenceAssessment {
  /** Assessment run identifier. */
  assessmentId: string;
  /** Target SKU. */
  sku: string;
  /** Product id context. */
  productId: string;
  /** Overall confidence level for the assessment. */
  confidence: ConfidenceLevel;
  /** Probability of good subjective fit (calibrated). */
  goodFitProbability: number;
  /** Probability of common misfit modes. */
  misfitModeProbabilities: Record<string, number>;
  /** Top supporting evidence ids. */
  supportingEvidenceIds: string[];
  /** Conflicting evidence ids. */
  conflictingEvidenceIds: string[];
  /** Narrative bullets for UI. */
  explanationBullets: string[];
  /** Whether assessment used generative try-on. */
  usedGenerativeSignals: boolean;
  /** ISO timestamp. */
  computedAt: string;
  /** Model bundle version. */
  modelVersion: string;
  /** Per-dimension residual stress estimates. */
  dimensionResiduals: Record<string, number>;
  /** Whether category-specific guardrails fired. */
  guardrailTriggers: string[];
  /** Optional calibration bin id for monitoring drift. */
  calibrationBinId?: string;
}

/**
 * Concrete size or variant pick with rationale for a shopper-product pair.
 */
export interface SizeRecommendation {
  /** Recommendation identifier. */
  recommendationId: string;
  /** Recommended variant SKU. */
  recommendedSku: string;
  /** Primary size label shown to shopper. */
  primarySizeLabel: string;
  /** Alternate acceptable size labels if inventory fluctuates. */
  acceptableAlternateLabels: string[];
  /** Confidence in this specific pick. */
  pickConfidence: ConfidenceLevel;
  /** Whether recommendation suggests sizing up/down vs chart default. */
  directionalHint: "size_up" | "size_down" | "true_to_size" | "split_size";
  /** Key measurement drivers for this pick. */
  driverDimensions: string[];
  /** Inventory feasibility score at time of compute. */
  inventoryFeasibility: number;
  /** Risk that adjacent size would be materially better. */
  adjacentSizeUncertainty: number;
  /** Merchant override rules applied. */
  appliedMerchantRules: string[];
  /** ISO timestamp. */
  computedAt: string;
  /** Optional bundle context if recommendation spans multiple SKUs. */
  bundleContextId?: string;
  /** Footwear-specific: half-size rounding policy used. */
  halfSizeRoundingPolicy?: string;
  /** Apparel-specific: shrinkage expectation factored in. */
  shrinkageExpectationPercent?: number;
}
