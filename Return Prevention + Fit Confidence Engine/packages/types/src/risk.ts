/**
 * Return events, standardized return reasons, risk profiles, interventions,
 * and preventable return categories for policy and model training.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel, RiskLevel } from "./scoring.js";

/**
 * Canonical return reason taxonomy aligned with analytics and prevention models.
 */
export enum ReturnReason {
  SizeTooSmall = "size_too_small",
  SizeTooLarge = "size_too_large",
  FitNotFlattering = "fit_not_flattering",
  ComfortMismatch = "comfort_mismatch",
  MaterialMismatch = "material_mismatch",
  ColorMismatch = "color_mismatch",
  QualityMismatch = "quality_mismatch",
  StyleMismatch = "style_mismatch",
  MaintenanceDifficulty = "maintenance_difficulty",
  AssemblyDifficulty = "assembly_difficulty",
  UseCaseMismatch = "use_case_mismatch",
  LogisticsRelated = "logistics_related",
  NotAsExpected = "not_as_expected",
  ChangedMind = "changed_mind",
  Defective = "defective",
}

/**
 * Coarse grouping for model priors and merchant dashboards.
 */
export enum ReturnReasonCategory {
  SizingAndFit = "sizing_and_fit",
  SensoryAndAesthetic = "sensory_and_aesthetic",
  QualityAndDurability = "quality_and_durability",
  UsabilityAndAssembly = "usability_and_assembly",
  ExpectationAndIntent = "expectation_and_intent",
  OperationsAndLogistics = "operations_and_logistics",
}

/**
 * Maps each {@link ReturnReason} to a high-level category for aggregation.
 */
export const RETURN_REASON_CATEGORY: Record<ReturnReason, ReturnReasonCategory> = {
  [ReturnReason.SizeTooSmall]: ReturnReasonCategory.SizingAndFit,
  [ReturnReason.SizeTooLarge]: ReturnReasonCategory.SizingAndFit,
  [ReturnReason.FitNotFlattering]: ReturnReasonCategory.SizingAndFit,
  [ReturnReason.ComfortMismatch]: ReturnReasonCategory.SensoryAndAesthetic,
  [ReturnReason.MaterialMismatch]: ReturnReasonCategory.SensoryAndAesthetic,
  [ReturnReason.ColorMismatch]: ReturnReasonCategory.SensoryAndAesthetic,
  [ReturnReason.QualityMismatch]: ReturnReasonCategory.QualityAndDurability,
  [ReturnReason.StyleMismatch]: ReturnReasonCategory.ExpectationAndIntent,
  [ReturnReason.MaintenanceDifficulty]: ReturnReasonCategory.UsabilityAndAssembly,
  [ReturnReason.AssemblyDifficulty]: ReturnReasonCategory.UsabilityAndAssembly,
  [ReturnReason.UseCaseMismatch]: ReturnReasonCategory.ExpectationAndIntent,
  [ReturnReason.LogisticsRelated]: ReturnReasonCategory.OperationsAndLogistics,
  [ReturnReason.NotAsExpected]: ReturnReasonCategory.ExpectationAndIntent,
  [ReturnReason.ChangedMind]: ReturnReasonCategory.ExpectationAndIntent,
  [ReturnReason.Defective]: ReturnReasonCategory.QualityAndDurability,
};

/**
 * Historical or synthetic return record for modeling and CX.
 */
export interface ReturnEvent {
  /** Unique return event identifier. */
  returnId: string;
  /** Original order identifier. */
  orderId: string;
  /** Line item identifier. */
  lineItemId: string;
  /** SKU being returned. */
  sku: string;
  /** Shopper identifier (pseudonymous). */
  userId: string;
  /** Tenant identifier. */
  tenantId: string;
  /** Primary reason code. */
  reason: ReturnReason;
  /** Free-text explanation from shopper or agent. */
  freeTextNote?: string;
  /** Category of product at time of purchase. */
  productCategory: ProductCategory;
  /** Whether return was preventable by better pre-purchase guidance. */
  deemedPreventable: boolean;
  /** Refunded amount minor units. */
  refundAmountMinor: number;
  /** Currency code. */
  currency: string;
  /** Reverse logistics cost estimate minor units. */
  reverseLogisticsCostMinor: number;
  /** Channel of purchase. */
  purchaseChannel: "web" | "app" | "store" | "marketplace";
  /** Timestamps across lifecycle. */
  purchasedAt: string;
  deliveredAt?: string;
  returnInitiatedAt: string;
  returnCompletedAt?: string;
  /** Tags from fraud or policy review. */
  policyTags: string[];
  /** Associated product id for joins. */
  productId: string;
}

/**
 * Shopper- or cohort-level return propensity with structured drivers.
 */
export interface ReturnRiskProfile {
  /** Profile identifier (user or cohort). */
  profileId: string;
  /** Scope of the profile. */
  scope: "user" | "cohort" | "segment";
  /** Overall risk tier. */
  overallRiskLevel: RiskLevel;
  /** Calibrated probability of any return in policy window. */
  baselineReturnProbability: number;
  /** Per-reason marginal probabilities (may not sum to 1; not mutually exclusive). */
  reasonMarginals: Partial<Record<ReturnReason, number>>;
  /** Sensitivity to discounting (promo abuse / regret). */
  promoSensitivityScore: number;
  /** Historical average items per order (basket complexity). */
  averageItemsPerOrder: number;
  /** Rate of bracketing behavior if observable. */
  bracketingRate: number;
  /** Whether profile is cold-started from demographics only. */
  coldStarted: boolean;
  /** Confidence in the profile estimate. */
  profileConfidence: ConfidenceLevel;
  /** Last recomputation time. */
  updatedAt: string;
  /** Tenant-specific risk flags (VIP, employee). */
  tenantFlags: string[];
  /** Optional link to loyalty tier features. */
  loyaltyTierFeatures?: Record<string, number>;
}

/**
 * Types of merchant or automated interventions to reduce returns.
 */
export enum RiskInterventionType {
  SizeGuidanceModal = "size_guidance_modal",
  LiveChatEscalation = "live_chat_escalation",
  AlternateSkuSuggestion = "alternate_sku_suggestion",
  PromoNeutralization = "promo_neutralization",
  ExtendedReturnWindow = "extended_return_window",
  RestockingFeeWaive = "restocking_fee_waive",
  EducationContent = "education_content",
  BundleDecomposition = "bundle_decomposition",
}

/**
 * Actionable intervention proposal with expected value modeling.
 */
export interface RiskIntervention {
  /** Intervention instance id. */
  interventionId: string;
  /** Intervention kind. */
  type: RiskInterventionType;
  /** Priority rank within the session (lower = higher priority). */
  priorityRank: number;
  /** Expected reduction in return probability if accepted. */
  expectedReturnProbabilityDelta: number;
  /** Estimated cost to merchant (minor units). */
  estimatedCostMinor: number;
  /** Copy variant id for A/B testing. */
  copyVariantId: string;
  /** Whether shopper must opt in. */
  requiresExplicitConsent: boolean;
  /** Channels where intervention is valid. */
  eligibleChannels: Array<"web" | "app" | "store">;
  /** Preconditions (inventory, price thresholds). */
  preconditions: string[];
  /** Post-intervention telemetry keys. */
  telemetryKeys: string[];
  /** ISO creation timestamp. */
  createdAt: string;
  /** Merchant policy constraints satisfied. */
  policyCompliant: boolean;
  /** Optional deep link to education asset. */
  educationAssetUrl?: string;
}

/**
 * Merchant-defined bucket for preventable returns used in reporting and models.
 */
export interface PreventableReturnCategory {
  /** Stable category id in tenant config. */
  categoryId: string;
  /** Human-readable name. */
  displayName: string;
  /** Mapped canonical return reasons included in this bucket. */
  includedReasons: ReturnReason[];
  /** Weight for prioritizing prevention investments. */
  businessPriorityWeight: number;
  /** Estimated average cost per occurrence (minor units). */
  estimatedCostPerEventMinor: number;
  /** Whether CX scripts exist for this bucket. */
  hasPlaybook: boolean;
  /** Applicable product categories. */
  applicableProductCategories: ProductCategory[];
  /** Model feature flags toggling specialized guidance. */
  modelFeatureFlags: string[];
  /** Owner team for operational review. */
  ownerTeam: string;
  /** ISO timestamp when definition last changed. */
  lastReviewedAt: string;
  /** Optional SLA for mitigation experiments. */
  mitigationSlaDays?: number;
  /** Success metrics tracked for this bucket. */
  successMetricKeys: string[];
}
