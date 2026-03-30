/**
 * Community-sourced feedback aggregates, per-signal records, and provenance
 * sources for social proof in fit and risk explanations.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * External or internal origin of a community signal.
 */
export interface CommunitySource {
  /** Source identifier. */
  sourceId: string;
  /** Source type for weighting and moderation policy. */
  sourceType:
    | "verified_purchase_review"
    | "unverified_review"
    | "q_and_a"
    | "social_mention"
    | "influencer_post"
    | "merchant_curated_testimonial"
    | "fit_finder_poll";
  /** Platform name if applicable. */
  platform?: string;
  /** URL to original content when shareable. */
  canonicalUrl?: string;
  /** Language code. */
  language: string;
  /** Moderation status. */
  moderationStatus: "pending" | "approved" | "rejected" | "escalated";
  /** Trust score after spam and fraud checks. */
  trustScore: number;
  /** Whether source is syndicated third-party. */
  syndicated: boolean;
  /** Tenant id for isolation. */
  tenantId: string;
  /** ISO timestamp when ingested. */
  ingestedAt: string;
  /** Licensing / usage rights for display. */
  displayRights: "owned" | "licensed" | "fair_use_summary_only";
  /** PII redaction level applied. */
  redactionLevel: "none" | "light" | "heavy";
  /** Source reliability prior used in models. */
  reliabilityPrior: number;
  /** Optional geographic spread of contributors for bias correction. */
  contributorGeoSpreadScore?: number;
}

/**
 * Atomic community-derived measurement for aggregation layers.
 */
export interface CommunitySignal {
  /** Signal identifier. */
  signalId: string;
  /** Product id scope. */
  productId: string;
  /** Variant sku scope if specific. */
  variantSku?: string;
  /** Semantic tag (runs_small, narrow_toe_box, etc.). */
  semanticTag: string;
  /** Polarity toward tag (-1 to 1). */
  polarity: number;
  /** Vote or mention count backing the signal. */
  supportWeight: number;
  /** Dissent weight for controversy modeling. */
  dissentWeight: number;
  /** Category for priors. */
  category: ProductCategory;
  /** Confidence after statistical shrinkage. */
  confidence: ConfidenceLevel;
  /** Contributing source ids. */
  sourceIds: string[];
  /** ISO window start for aggregation. */
  windowStart: string;
  /** ISO window end for aggregation. */
  windowEnd: string;
  /** Demographic cohort keys (coarse, privacy-safe). */
  cohortKeys: string[];
  /** Whether signal is seasonally adjusted. */
  seasonallyAdjusted: boolean;
  /** Method used to extract tag (NLP vs structured). */
  extractionMethod: "nlp" | "structured" | "hybrid";
  /** Whether signal passed adversarial review. */
  adversarialReviewPassed: boolean;
  /** Optional effect size vs brand baseline. */
  effectSizeVsBrandBaseline?: number;
  /** Related size chart row keys if sizing-related. */
  relatedChartRowKeys?: string[];
}

/**
 * Rollup for PDP and decision explanations combining community signals.
 */
export interface CommunityFeedbackSummary {
  /** Summary identifier. */
  summaryId: string;
  /** Product id. */
  productId: string;
  /** Optional variant focus. */
  focusVariantSku?: string;
  /** Net sentiment toward fit (-1 to 1). */
  aggregateFitSentiment: number;
  /** Fraction of mentions flagging sizing issues. */
  sizingIssueRate: number;
  /** Top semantic tags with weights. */
  topTags: Array<{ tag: string; weight: number; controversy: number }>;
  /** Sample size after deduplication. */
  effectiveSampleSize: number;
  /** Confidence in the aggregate. */
  aggregateConfidence: ConfidenceLevel;
  /** Whether data is sparse for this SKU. */
  sparseDataWarning: boolean;
  /** Category-specific caveats (e.g., break-in for footwear). */
  categoryCaveats: string[];
  /** ISO timestamp of aggregation. */
  computedAt: string;
  /** Whether summary includes Q&A content. */
  includesQandA: boolean;
  /** Whether influencer content excluded from aggregate. */
  excludesInfluencerContent: boolean;
  /** Regional breakdown available flag. */
  hasRegionalBreakdown: boolean;
  /** Most representative quotes (ids only). */
  exemplarEvidenceIds: string[];
  /** Bias correction notes from statisticians. */
  biasCorrectionNotes?: string[];
  /** Whether merchant boosted verified purchasers in weighting. */
  verifiedPurchaseWeightingApplied: boolean;
  /** Data freshness in hours. */
  freshnessHours: number;
  /** Minimum threshold for displaying community section in UI. */
  meetsMinimumDisclosureThreshold: boolean;
}
