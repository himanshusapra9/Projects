/**
 * Behavioral telemetry, feedback events, and conversational turns for online
 * learning, personalization, and session understanding.
 */

import type { ProductCategory } from "./product.js";
import type { ReturnReason } from "./risk.js";
import type { ConfidenceLevel } from "./scoring.js";

/** Common fields for all behavior events. */
interface BehaviorEventBase {
  /** Unique event identifier. */
  eventId: string;
  /** Tenant identifier. */
  tenantId: string;
  /** Session identifier. */
  sessionId: string;
  /** User identifier if known. */
  userId?: string;
  /** ISO timestamp when the event occurred. */
  occurredAt: string;
  /** Client device class. */
  deviceClass: "mobile" | "tablet" | "desktop";
  /** App release or web bundle version. */
  clientVersion: string;
  /** Whether user was authenticated. */
  authenticated: boolean;
  /** A/B experiment buckets active at emit time. */
  experimentBuckets: Record<string, string>;
  /** Privacy consent level for processing. */
  consentLevel: "essential" | "functional" | "personalization" | "full";
  /** Correlation id across services. */
  traceId: string;
}

/**
 * Product detail page or tile impression with engagement hints.
 */
export interface ProductViewedEvent extends BehaviorEventBase {
  type: "product_viewed";
  productId: string;
  category: ProductCategory;
  /** Position in carousel or search results. */
  surfacePosition: number;
  /** Referrer surface. */
  referrerSurface: string;
  /** Whether image gallery opened. */
  galleryOpened: boolean;
  /** Time on PDP milliseconds if session ended. */
  dwellMs?: number;
  /** Primary variant preselected. */
  defaultVariantSku?: string;
}

/**
 * Shopper opened size guide or fit modal.
 */
export interface SizeGuideOpenedEvent extends BehaviorEventBase {
  type: "size_guide_opened";
  productId: string;
  /** Chart id if known. */
  chartId?: string;
  /** Entry point (link vs auto). */
  entryPoint: "manual" | "recommendation_prompt" | "sticky_banner";
  /** Time spent in guide milliseconds. */
  timeInGuideMs: number;
}

/**
 * Variant selection change on PDP or quick view.
 */
export interface VariantSelectedEvent extends BehaviorEventBase {
  type: "variant_selected";
  productId: string;
  fromSku?: string;
  toSku: string;
  /** Selection source. */
  selectionSource: "dropdown" | "swatch" | "recommendation_chip" | "url_param";
}

/**
 * Add to cart action.
 */
export interface AddToCartEvent extends BehaviorEventBase {
  type: "add_to_cart";
  productId: string;
  sku: string;
  quantity: number;
  cartCurrency: string;
  lineTotalMinor: number;
  /** Whether size/fit recommendation was shown beforehand. */
  recommendationShownPrior: boolean;
}

/**
 * Remove from cart action.
 */
export interface RemoveFromCartEvent extends BehaviorEventBase {
  type: "remove_from_cart";
  productId: string;
  sku: string;
  quantityRemoved: number;
  /** Reason if collected. */
  removalReason?: string;
}

/**
 * Checkout funnel start.
 */
export interface CheckoutStartedEvent extends BehaviorEventBase {
  type: "checkout_started";
  cartId: string;
  itemCount: number;
  cartValueMinor: number;
  currency: string;
}

/**
 * Purchase completion (order placed).
 */
export interface PurchaseCompletedEvent extends BehaviorEventBase {
  type: "purchase_completed";
  orderId: string;
  productIds: string[];
  skus: string[];
  orderValueMinor: number;
  currency: string;
  /** Payment instrument family (card, wallet) non-PII. */
  paymentInstrumentFamily: string;
}

/**
 * Return flow initiated post-purchase.
 */
export interface ReturnInitiatedEvent extends BehaviorEventBase {
  type: "return_initiated";
  orderId: string;
  sku: string;
  reason: ReturnReason;
  /** Whether shopper used guided return flow. */
  guidedFlow: boolean;
}

/**
 * Search query submitted on storefront.
 */
export interface SearchQuerySubmittedEvent extends BehaviorEventBase {
  type: "search_query_submitted";
  queryText: string;
  /** Normalized query for analytics. */
  normalizedQuery: string;
  /** Result count returned. */
  resultCount: number;
  /** Search vertical (product, content). */
  vertical: "product" | "content" | "mixed";
}

/**
 * Filter or facet applied on PLP or search.
 */
export interface FilterAppliedEvent extends BehaviorEventBase {
  type: "filter_applied";
  filterKey: string;
  filterValues: string[];
  /** Surface where filter was applied. */
  surface: "search" | "collection" | "recommendation_rail";
  /** Whether filter was suggested by engine. */
  engineSuggested: boolean;
}

/**
 * Answer submitted to a clarification question from the engine.
 */
export interface ClarificationAnsweredEvent extends BehaviorEventBase {
  type: "clarification_answered";
  questionId: string;
  productId: string;
  /** Opaque answer payload. */
  answerPayload: Record<string, unknown>;
  /** Whether answer increased model confidence. */
  confidenceDelta?: number;
}

/**
 * Recommendation module rendered (impression).
 */
export interface RecommendationImpressionEvent extends BehaviorEventBase {
  type: "recommendation_impression";
  placementId: string;
  productIds: string[];
  /** Decision id if from fit engine. */
  decisionId?: string;
  /** Module variant for experiments. */
  moduleVariant: string;
}

/**
 * Click on a recommended item.
 */
export interface RecommendationClickedEvent extends BehaviorEventBase {
  type: "recommendation_clicked";
  placementId: string;
  productId: string;
  sku?: string;
  position: number;
  decisionId?: string;
}

/**
 * Scroll depth milestone for content engagement.
 */
export interface ScrollDepthMilestoneEvent extends BehaviorEventBase {
  type: "scroll_depth_milestone";
  surfaceId: string;
  milestonePercent: 25 | 50 | 75 | 100;
  productId?: string;
}

/**
 * Product video or UGC video engagement.
 */
export interface VideoWatchedEvent extends BehaviorEventBase {
  type: "video_watched";
  productId: string;
  videoId: string;
  watchPercent: number;
  autoplay: boolean;
}

/**
 * Customer service chat message from shopper.
 */
export interface ChatMessageSentEvent extends BehaviorEventBase {
  type: "chat_message_sent";
  conversationId: string;
  /** Intent classifier output if available. */
  intent?: string;
  /** Length of message tokens approx. */
  tokenLengthBucket: "short" | "medium" | "long";
}

/**
 * Marketing email link click leading to storefront.
 */
export interface EmailClickEvent extends BehaviorEventBase {
  type: "email_click";
  campaignId: string;
  linkId: string;
  landingProductId?: string;
  /** UTM parameters normalized. */
  utm: Record<string, string>;
}

/**
 * Wishlist or save-for-later mutation.
 */
export interface WishlistAddEvent extends BehaviorEventBase {
  type: "wishlist_add";
  productId: string;
  sku?: string;
  wishlistId: string;
}

/**
 * Explicit thumbs feedback on a recommendation or explanation.
 */
export interface ExplicitRatingEvent extends BehaviorEventBase {
  type: "explicit_rating";
  targetType: "recommendation" | "explanation" | "size_guide";
  targetId: string;
  rating: -1 | 1;
  freeText?: string;
}

/**
 * Error or frustration signal (rage click proxy).
 */
export interface FrustrationSignalEvent extends BehaviorEventBase {
  type: "frustration_signal";
  surfaceId: string;
  signalKind: "rapid_click" | "form_abandon" | "back_navigation";
  productId?: string;
}

/**
 * Union of all supported behavior events (discriminated by `type`).
 */
export type BehaviorEvent =
  | ProductViewedEvent
  | SizeGuideOpenedEvent
  | VariantSelectedEvent
  | AddToCartEvent
  | RemoveFromCartEvent
  | CheckoutStartedEvent
  | PurchaseCompletedEvent
  | ReturnInitiatedEvent
  | SearchQuerySubmittedEvent
  | FilterAppliedEvent
  | ClarificationAnsweredEvent
  | RecommendationImpressionEvent
  | RecommendationClickedEvent
  | ScrollDepthMilestoneEvent
  | VideoWatchedEvent
  | ChatMessageSentEvent
  | EmailClickEvent
  | WishlistAddEvent
  | ExplicitRatingEvent
  | FrustrationSignalEvent;

/**
 * Typed feedback tied to engine outputs for reward modeling.
 */
export interface FeedbackEvent {
  /** Feedback identifier. */
  feedbackId: string;
  /** User id if known. */
  userId?: string;
  /** Session id. */
  sessionId: string;
  /** Product context. */
  productId: string;
  /** Decision id from engine if applicable. */
  decisionId?: string;
  /** Feedback type. */
  feedbackType:
    | "helpful"
    | "not_helpful"
    | "incorrect_size"
    | "report_issue"
    | "follow_up_question";
  /** Structured payload. */
  payload: Record<string, unknown>;
  /** Confidence in feedback authenticity. */
  authenticityConfidence: ConfidenceLevel;
  /** ISO timestamp. */
  submittedAt: string;
  /** Channel where feedback collected. */
  channel: "web" | "app" | "email" | "sms";
  /** Locale. */
  locale: string;
  /** Whether incentive offered for feedback (bias note). */
  incentiveOffered: boolean;
  /** Moderation status. */
  moderationStatus: "pending" | "approved" | "rejected";
  /** Associated SKU if narrow. */
  sku?: string;
  /** Tenant id. */
  tenantId: string;
  /** Follow-up ticket id if escalated. */
  supportTicketId?: string;
  /** Whether user allowed follow-up contact. */
  allowFollowUpContact: boolean;
  /** Sentiment of free text if any. */
  freeTextSentiment?: number;
  /** Tags for clustering feedback themes. */
  themeTags: string[];
}

/**
 * Single turn in a guided sizing or concierge conversation.
 */
export interface ConversationTurn {
  /** Turn identifier. */
  turnId: string;
  /** Conversation identifier. */
  conversationId: string;
  /** Turn index starting at 0. */
  turnIndex: number;
  /** Speaker. */
  role: "user" | "assistant" | "system";
  /** Message text or structured content. */
  content: string;
  /** Tool calls if assistant invoked retrieval or calculators. */
  toolCalls?: Array<{
    toolName: string;
    arguments: Record<string, unknown>;
    resultSummary: string;
  }>;
  /** ISO timestamp. */
  createdAt: string;
  /** Language. */
  language: string;
  /** Whether turn contains PII that must be redacted in logs. */
  containsPotentialPii: boolean;
  /** Intent label if classified. */
  intentLabel?: string;
  /** Confidence in NLU parsing. */
  nluConfidence?: number;
  /** Related product ids mentioned. */
  mentionedProductIds: string[];
  /** Whether turn led to a decision response. */
  producedDecisionId?: string;
  /** Token usage for cost accounting. */
  promptTokens?: number;
  completionTokens?: number;
  /** Safety categories triggered (if any). */
  safetyCategoriesTriggered: string[];
  /** Whether turn was handoff to human. */
  escalatedToHuman: boolean;
  /** Satisfaction score if captured next turn. */
  userSatisfactionScore?: number;
  /** Retrieval citations for RAG grounding. */
  retrievalCitationIds?: string[];
}
