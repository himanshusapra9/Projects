/**
 * Quantitative and qualitative scoring models for fit confidence, return risk,
 * size alignment, and alternative ranking within the engine.
 */

/**
 * Ordinal confidence bands produced by calibrated models or heuristic stacks.
 */
export enum ConfidenceLevel {
  /** Strong agreement across signals; narrow uncertainty interval. */
  VeryHigh = "very_high",
  /** Reliable for most shoppers; minor residual ambiguity. */
  High = "high",
  /** Usable recommendation with explicit caveats. */
  Medium = "medium",
  /** Weak signal agreement; heavy reliance on priors or sparse data. */
  Low = "low",
  /** Insufficient evidence; recommendation is exploratory only. */
  VeryLow = "very_low",
}

/**
 * Business-facing risk tier for operational routing (CX, promotions, logistics).
 */
export enum RiskLevel {
  Negligible = "negligible",
  Low = "low",
  Moderate = "moderate",
  Elevated = "elevated",
  High = "high",
  Critical = "critical",
}

/**
 * How a fit score was derived (model lineage and auditability).
 */
export enum FitScoreSource {
  OnBodyModel = "on_body_model",
  ReviewNlp = "review_nlp",
  CommunityConsensus = "community_consensus",
  MerchantRules = "merchant_rules",
  HistoricalReturns = "historical_returns",
  SizeChartAlignment = "size_chart_alignment",
  HybridEnsemble = "hybrid_ensemble",
}

/**
 * Aggregate fit quality for a candidate SKU relative to the shopper profile.
 */
export interface FitScore {
  /** Stable identifier for the scoring run (trace / replay). */
  scoreRunId: string;
  /** Normalized fit quality in [0, 1]; higher is better alignment. */
  value: number;
  /** Calibrated confidence level for this score. */
  confidence: ConfidenceLevel;
  /** Primary method that dominated the composite. */
  dominantSource: FitScoreSource;
  /** Per-source contributions summing conceptually to the composite. */
  sourceWeights: Record<FitScoreSource, number>;
  /** Human-readable rationale snippets tied to evidence IDs. */
  rationaleBullets: string[];
  /** Dimensions that most improved the score (e.g., torso length). */
  positiveDrivers: string[];
  /** Dimensions that most hurt the score. */
  negativeDrivers: string[];
  /** Whether the score used imputed or default body measurements. */
  usedImputedMeasurements: boolean;
  /** Version string of the model bundle that produced the score. */
  modelVersion: string;
  /** ISO timestamp when computed. */
  computedAt: string;
  /** Optional linkage to evaluation harness for regression tests. */
  evaluationCaseId?: string;
}

/**
 * Return propensity score with calibrated uncertainty for interventions.
 */
export interface ReturnRiskScore {
  /** Probability mass or calibrated score in [0, 1] for return within policy window. */
  probability: number;
  /** Discrete tier for policy engines. */
  riskLevel: RiskLevel;
  /** Confidence in the risk estimate itself. */
  estimateConfidence: ConfidenceLevel;
  /** Top semantic drivers (e.g., "size_chart_brand_drift"). */
  topContributors: string[];
  /** Expected cost impact if return occurs (merchant currency minor units optional). */
  expectedMerchantCostCents?: number;
  /** Whether expedited shipping or promo increases perceived risk. */
  logisticsRiskModifier: number;
  /** Sensitivity to price paid vs perceived value gap. */
  valueGapSensitivity: number;
  /** Historical cohort similarity score for cold-start users. */
  cohortSimilarity: number;
  /** Whether risk was elevated due to category-specific fragility. */
  categoryFragilityBoost: boolean;
  /** ISO timestamp of computation. */
  computedAt: string;
  /** Optional link to the return taxonomy bucket most likely. */
  dominantPreventableCategoryId?: string;
}

/**
 * Alignment between a recommended size/variant and measurement priors.
 */
export interface SizeScore {
  /** Candidate size label (e.g., "M", "32x32", "EU 42"). */
  sizeLabel: string;
  /** Numeric alignment score in [0, 1]. */
  alignment: number;
  /** Penalty stack from brand-specific deltas vs generic charts. */
  brandDeltaPenalty: number;
  /** Stretch/compression tolerance match for knits vs wovens. */
  fabricStretchCompatibility: number;
  /** How well layered sizing (inseam + waist) agrees. */
  multiAxisConsistency: number;
  /** Confidence that the label maps to real inventory. */
  inventoryConfidence: number;
  /** Whether the shopper’s stated preference conflicts with chart guidance. */
  conflictsWithStatedPreference: boolean;
  /** Raw chart row key used for audit. */
  chartRowKey: string;
  /** ISO timestamp. */
  computedAt: string;
  /** Optional variant SKU if size maps to a specific SKU. */
  variantSku?: string;
  /** Notes for CX if size sits between chart rows. */
  interpolationNotes?: string;
}

/**
 * Ranking score for alternative SKUs in the consideration set.
 */
export interface AlternativeScore {
  /** Alternative SKU or bundle identifier. */
  alternativeId: string;
  /** Utility score for ranking (higher is better). */
  utility: number;
  /** Fit component of utility. */
  fitComponent: number;
  /** Risk component of utility (inverted risk contributes positively). */
  riskComponent: number;
  /** Price/value component. */
  valueComponent: number;
  /** Diversity bonus to avoid near-duplicate recommendations. */
  diversityBonus: number;
  /** Merchant merchandising boost (campaigns, clearance rules). */
  merchandisingBoost: number;
  /** Whether this alternative is in-stock across required nodes. */
  inStock: boolean;
  /** Estimated delivery SLA days for the alternative. */
  estimatedDeliveryDays: number;
  /** Whether alternative reduces a specific preventable return driver. */
  mitigatesDriverIds: string[];
  /** Confidence in the comparative ranking. */
  rankConfidence: ConfidenceLevel;
  /** Explainability token for UI. */
  rankReasonToken: string;
}

/**
 * Machine- and human-readable reason codes when confidence is limited.
 */
export interface UncertaintyReason {
  /** Stable code for analytics and routing. */
  code: string;
  /** Severity of this uncertainty on the final decision. */
  severity: "blocking" | "material" | "informational";
  /** Short explanation for product surfaces. */
  message: string;
  /** Remediation hints (e.g., ask measurement, confirm use case). */
  suggestedRemediations: string[];
  /** Related signal IDs that were sparse or conflicting. */
  relatedSignalIds: string[];
  /** Whether more community data would likely resolve this. */
  communityDataWouldHelp: boolean;
  /** Whether tenant policy suppresses certain clarifications. */
  suppressedByPolicy: boolean;
  /** ISO timestamp when reason was attached. */
  recordedAt: string;
  /** Optional correlation to evaluation fixtures. */
  fixtureTag?: string;
}
