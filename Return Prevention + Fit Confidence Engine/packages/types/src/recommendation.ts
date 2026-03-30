/**
 * Core decision outputs, alternatives, evidence references, and clarification
 * prompts for the Return Prevention + Fit Confidence Engine API surface.
 */

import type { CommunityFeedbackSummary } from "./community.js";
import type { FitConfidenceAssessment, SizeRecommendation } from "./fit.js";
import type { MemoryEntry } from "./memory.js";
import type {
  AlternativeScore,
  ConfidenceLevel,
  FitScore,
  ReturnRiskScore,
  UncertaintyReason,
} from "./scoring.js";

/**
 * Pointer to an auditable evidence artifact used in explanations.
 */
export interface EvidenceReference {
  /** Evidence identifier in the evidence store. */
  evidenceId: string;
  /** Type of evidence for UI rendering. */
  evidenceKind:
    | "review_snippet"
    | "size_chart_row"
    | "return_statistic"
    | "merchant_note"
    | "community_vote"
    | "behavior_aggregate";
  /** Short label for chips and footnotes. */
  shortLabel: string;
  /** Deep link or API ref to fetch full content. */
  resourceUri: string;
  /** Language of underlying text if applicable. */
  language: string;
  /** Trust score after moderation. */
  trustScore: number;
  /** Whether evidence is purchase-verified. */
  purchaseVerified: boolean;
  /** ISO timestamp when evidence was observed. */
  observedAt: string;
  /** Related product id. */
  productId: string;
  /** Related variant sku if narrow. */
  variantSku?: string;
  /** Snippet text safe for direct display. */
  redactedSnippet?: string;
  /** Provenance chain (ingestion job ids). */
  provenanceChain: string[];
  /** Whether evidence is tenant-curated vs organic. */
  curatedByMerchant: boolean;
  /** Confidence in relevance to current decision. */
  relevanceConfidence: ConfidenceLevel;
  /** Optional evaluation harness fixture id. */
  evaluationFixtureId?: string;
}

/**
 * Ranked alternative SKU with comparative framing.
 */
export interface AlternativeRecommendation {
  /** Alternative SKU identifier. */
  sku: string;
  /** Product id for navigation. */
  productId: string;
  /** Human title for the alternative. */
  title: string;
  /** Why this alternative exists in the set. */
  positioningReason: string;
  /** Score bundle driving rank order. */
  score: AlternativeScore;
  /** Expected fit summary vs primary pick. */
  comparativeFitSummary: string;
  /** Expected return risk comparison vs primary pick. */
  comparativeRiskSummary: string;
  /** Price delta vs primary pick (minor units, can be negative). */
  priceDeltaMinor: number;
  /** Currency for price delta. */
  currency: string;
  /** Tradeoffs in bullet form. */
  tradeoffBullets: string[];
  /** Whether alternative is recommended for inventory reasons. */
  inventoryDriven: boolean;
  /** Image URL for quick comparison UI. */
  imageUrl?: string;
  /** Whether alternative matches a stated shopper preference better. */
  matchesStatedPreference: boolean;
  /** Badges (eco, sale, staff pick). */
  merchandisingBadges: string[];
  /** ISO timestamp when alternative set was computed. */
  computedAt: string;
  /** Optional bundle id if alternative is a kit. */
  bundleId?: string;
  /** Stock likelihood score at primary fulfillment node. */
  stockLikelihoodScore: number;
}

/**
 * Structured follow-up question when confidence is insufficient.
 */
export interface ClarificationQuestion {
  /** Question identifier for analytics. */
  questionId: string;
  /** Prompt shown to shopper. */
  promptText: string;
  /** Input modality. */
  inputKind:
    | "single_select"
    | "multi_select"
    | "measurement"
    | "free_text"
    | "boolean";
  /** Options when applicable. */
  options?: Array<{ value: string; label: string; description?: string }>;
  /** Unit hint for measurement questions. */
  measurementUnit?: string;
  /** Whether answer is required to proceed. */
  required: boolean;
  /** Priority order if multiple questions returned. */
  priority: number;
  /** Which uncertainty codes this question targets. */
  targetsUncertaintyCodes: string[];
  /** Estimated information gain if answered. */
  expectedInformationGain: number;
  /** Privacy sensitivity of the question. */
  privacySensitivity: "low" | "medium" | "high";
  /** Estimated time to answer (seconds) for UX. */
  estimatedSecondsToAnswer: number;
  /** Whether question should be shown post-add-to-cart only. */
  deferUntilCheckout: boolean;
  /** Localization key for prompt if using CMS. */
  localizationKey?: string;
  /** Telemetry tag for A/B testing copy. */
  copyVariantTag?: string;
  /** Help article URL. */
  helpArticleUrl?: string;
  /** Whether declining still allows checkout. */
  allowsSkipWithDefault: boolean;
}

/**
 * Primary API response from the decision engine for a product context.
 */
export interface DecisionResponse {
  /** Identifier for this decision (idempotency / logging). */
  decisionId: string;
  /** Tenant id. */
  tenantId: string;
  /** Product id under consideration. */
  productId: string;
  /** Session id if present. */
  sessionId?: string;
  /** User id if present. */
  userId?: string;
  /**
   * Canonical “best” pick summarizing SKU, scoring, and merchandising alignment.
   */
  best_pick: {
    sku: string;
    title: string;
    primaryReason: string;
    fitScore: FitScore;
    returnRisk: ReturnRiskScore;
    merchantPriorityTags: string[];
    /** Whether pick respects stated constraints (budget, color). */
    constraintSatisfied: boolean;
    /** ISO timestamp when pick was finalized. */
    decidedAt: string;
    /** Optional promotion applied to this pick. */
    appliedPromotionIds: string[];
    /** Fulfillment ETA days at decision time. */
    fulfillmentEtaDays: number;
    /** Whether SKU is default variant. */
    isDefaultVariant: boolean;
    /** Stock confidence at decision time. */
    stockConfidence: number;
    /** Sustainability score if tenant tracks it. */
    sustainabilityScore?: number;
  };
  /**
   * Detailed size/variant recommendation object (may mirror best_pick.sku).
   */
  recommended_size_or_variant: SizeRecommendation;
  /** Fit confidence assessment for the recommended variant. */
  fit_confidence: FitConfidenceAssessment;
  /** Return risk scoring for the recommended path. */
  return_risk: ReturnRiskScore;
  /**
   * Narrative explanation with evidence-backed bullets for shopper trust.
   */
  explanation: {
    headline: string;
    /** Ordered paragraphs or bullets for UI. */
    sections: Array<{
      heading?: string;
      body: string;
      evidenceRefs: EvidenceReference[];
    }>;
    /** Overall tone calibrated to brand voice token. */
    voiceToken: string;
    /** Reading level target. */
    readingLevel: "easy" | "standard" | "advanced";
    /** Whether explanation uses community voice. */
    includesCommunityVoice: boolean;
    /** Whether generative text was human-reviewed in this tenant. */
    humanReviewedTemplate: boolean;
    /** Localization keys used. */
    localizationKeys: string[];
    /** Safety disclaimers where regulated (beauty, electronics). */
    disclaimers: string[];
    /** Links to educational assets. */
    educationLinks: Array<{ label: string; url: string }>;
    /** Character budget consumed on client. */
    approximateCharacterCount: number;
    /** Whether explanation was truncated for channel. */
    truncatedForChannel: boolean;
    /** Confidence in narrative factual grounding. */
    narrativeGroundingConfidence: ConfidenceLevel;
  };
  /**
   * Explicit tradeoffs between fit, risk, price, and style dimensions.
   */
  tradeoffs: Array<{
    dimension: string;
    /** What improves if shopper accepts downside. */
    upside: string;
    /** What worsens or becomes riskier. */
    downside: string;
    /** Severity weight for sorting tradeoffs. */
    severity: number;
    /** Whether tradeoff is reversible via a different SKU. */
    reversibleBySku: boolean;
    /** Related alternative sku if any. */
    relatedSku?: string;
    /** Evidence backing the tradeoff claim. */
    evidenceRefs: EvidenceReference[];
    /** Merchant policy note if applicable. */
    policyNote?: string;
    /** Whether tradeoff interacts with return policy window. */
    affectsReturnPolicy: boolean;
  }>;
  /** Ranked substitutes and complements that reduce return risk or improve fit. */
  alternatives: AlternativeRecommendation[];
  /**
   * Filters or PDP refinements that would improve decision quality if applied.
   */
  suggested_refinements: Array<{
    refinementKey: string;
    displayLabel: string;
    /** Suggested filter values or chips. */
    suggestedValues: string[];
    /** Why this refinement helps. */
    rationale: string;
    /** Priority for UI ordering. */
    priority: number;
    /** Whether refinement is already partially applied. */
    partiallyApplied: boolean;
    /** Deep link to apply refinement on storefront. */
    applyDeepLink?: string;
    /** Expected confidence gain if applied. */
    expectedConfidenceGain: number;
    /** Category of refinement (size, color, feature). */
    refinementCategory: string;
    /** Whether refinement requires inventory at local store. */
    requiresLocalInventory: boolean;
    /** ISO timestamp when suggestion was generated. */
    generatedAt: string;
    /** Merchant feature flag gating this refinement. */
    featureFlagKey?: string;
    /** Analytics tag. */
    telemetryTag: string;
  }>;
  /**
   * Memory entries that influenced weighting (subset for explainability).
   */
  memory_applied: MemoryEntry[];
  /**
   * Compact identifiers of behavior aggregates or events used in scoring.
   */
  behavior_signals_used: Array<{
    signalId: string;
    signalType: string;
    weight: number;
    description: string;
    firstObservedAt: string;
    lastObservedAt: string;
    confidence: ConfidenceLevel;
    /** Whether signal is session-only. */
    ephemeral: boolean;
    /** Related product or category scope. */
    scopeProductId?: string;
    scopeCategory?: string;
    /** Raw support count behind aggregation. */
    supportCount: number;
    /** Whether signal was downweighted for privacy. */
    privacyDownweighted: boolean;
    /** Optional link to evaluation harness. */
    evaluationTag?: string;
  }>;
  /** Aggregated community sentiment and fit cues for the product/variant. */
  community_feedback_summary: CommunityFeedbackSummary;
  /** Structured reasons the model is uncertain; drives clarification UX. */
  uncertainty_reasons: UncertaintyReason[];
  /**
   * Highest-value follow-up question if the engine needs more information.
   */
  next_best_question_if_needed: ClarificationQuestion | null;
  /** Engine latency budget tier used. */
  latencyBudgetTier: "interactive" | "standard" | "relaxed";
  /** ISO timestamp when response was composed. */
  responseGeneratedAt: string;
  /** Schema version for API compatibility. */
  schemaVersion: string;
  /** Whether response includes deterministic replay metadata. */
  deterministicReplayToken?: string;
  /** Optional debug flags for internal clients only. */
  internalDebugFlags?: Record<string, boolean>;
}
