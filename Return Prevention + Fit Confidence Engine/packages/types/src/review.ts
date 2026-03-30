/**
 * Product reviews, NLP-derived summaries, and structured fit signals mined
 * from unstructured text for modeling and explanations.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * Single review record with moderation and verification metadata.
 */
export interface Review {
  /** Review identifier. */
  reviewId: string;
  /** Product id. */
  productId: string;
  /** Variant sku if review is variant-specific. */
  variantSku?: string;
  /** Star rating (1-5). */
  starRating: number;
  /** Review title. */
  title?: string;
  /** Full review body text. */
  body: string;
  /** ISO timestamp of submission. */
  submittedAt: string;
  /** Whether purchase verified. */
  verifiedPurchase: boolean;
  /** Helpful vote count. */
  helpfulUpvotes: number;
  /** Language code. */
  language: string;
  /** Moderation labels. */
  moderationLabels: string[];
  /** Whether review contains fit-related content. */
  containsFitContent: boolean;
  /** Whether media attached. */
  hasMedia: boolean;
  /** Author display name (pseudonymous). */
  authorDisplayName?: string;
  /** Merchant tenant id. */
  tenantId: string;
  /** Source system for ingestion. */
  sourceSystem: string;
  /** Whether syndicated from third party. */
  syndicated: boolean;
  /** Whether review was edited post-submission. */
  editedAfterSubmission: boolean;
  /** Country/region of reviewer if available. */
  reviewerRegion?: string;
  /** Return correlation flag from post-purchase linkage. */
  associatedWithReturn: boolean;
  /** Hash for deduplication across channels. */
  contentHash: string;
  /** Whether review passed toxicity filter. */
  passedToxicityFilter: boolean;
  /** Optional structured attributes (size purchased, height). */
  structuredAttributes?: Record<string, string>;
}

/**
 * Aggregated review analytics for PDP and model features.
 */
export interface ReviewSummary {
  /** Summary identifier. */
  summaryId: string;
  /** Product id. */
  productId: string;
  /** Variant sku if scoped. */
  variantSku?: string;
  /** Count of reviews included. */
  reviewCount: number;
  /** Average star rating. */
  averageStars: number;
  /** Star histogram buckets. */
  starHistogram: Record<"1" | "2" | "3" | "4" | "5", number>;
  /** Recent trend vs prior period (-1 to 1). */
  recentSentimentTrend: number;
  /** ISO timestamp of computation. */
  computedAt: string;
  /** Data freshness window in days. */
  freshnessWindowDays: number;
  /** Percentage verified purchase. */
  verifiedPurchaseShare: number;
  /** Top positive themes. */
  positiveThemes: string[];
  /** Top negative themes. */
  negativeThemes: string[];
  /** Whether summary is statistically significant sample. */
  meetsMinimumSampleSize: boolean;
  /** Category for baseline comparisons. */
  category: ProductCategory;
  /** Language mix codes. */
  languageMix: Record<string, number>;
  /** Whether media-heavy reviews overweighted in sentiment. */
  mediaReviewsWeighted: boolean;
  /** Return mention rate in reviews. */
  returnMentionRate: number;
  /** Confidence in aggregate metrics. */
  metricsConfidence: ConfidenceLevel;
  /** Seasonality adjustment applied. */
  seasonalityAdjusted: boolean;
}

/**
 * NLP-extracted fit-related structured signal from a review or Q&A.
 */
export interface ReviewFitSignal {
  /** Signal identifier. */
  signalId: string;
  /** Parent review id. */
  reviewId: string;
  /** Product id. */
  productId: string;
  /** Extracted tag (runs_small, itchy_fabric, etc.). */
  tag: string;
  /** Polarity magnitude. */
  polarity: number;
  /** Confidence in extraction. */
  extractionConfidence: ConfidenceLevel;
  /** Span offsets in review text for highlighting. */
  textSpans: Array<{ start: number; end: number }>;
  /** Model version used for extraction. */
  modelVersion: string;
  /** ISO timestamp of extraction job. */
  extractedAt: string;
  /** Whether human-validated on a sample. */
  humanValidatedSample: boolean;
  /** Related size intent (ordered size vs recommended). */
  sizeIntent?: "ordered_true_to_size" | "sized_up" | "sized_down" | "unknown";
  /** Whether signal references body measurements explicitly. */
  mentionsBodyMeasurements: boolean;
  /** Mapped ontology concept id. */
  ontologyConceptId?: string;
  /** Conflicting signal ids from same review. */
  siblingConflictIds: string[];
  /** Category for applying priors. */
  category: ProductCategory;
  /** Whether signal should influence automated size guidance. */
  eligibleForSizeGuidance: boolean;
  /** Weight after deduplication across reviews. */
  dedupWeight: number;
  /** Spam score from adversarial model. */
  spamScore: number;
}
