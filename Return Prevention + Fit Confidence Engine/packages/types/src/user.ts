/**
 * Shopper identity, durable preferences, and ephemeral session context for
 * personalization and risk-aware recommendations.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * Authentication and profile richness indicators for a shopper.
 */
export enum UserProfileTier {
  Anonymous = "anonymous",
  RecognizedDevice = "recognized_device",
  SoftAccount = "soft_account",
  VerifiedAccount = "verified_account",
  LoyaltyEnriched = "loyalty_enriched",
}

/**
 * Long-lived shopper profile spanning devices and sessions.
 */
export interface UserProfile {
  /** Stable user identifier (pseudonymous). */
  userId: string;
  /** Tenant scope. */
  tenantId: string;
  /** Profile tier affecting data access and personalization depth. */
  tier: UserProfileTier;
  /** Primary locale for copy and sizing defaults. */
  locale: string;
  /** Preferred currency for display. */
  preferredCurrency: string;
  /** Shipping region for logistics risk and size region defaults. */
  shippingRegionCode: string;
  /** Marketing consent flags. */
  consentFlags: Record<string, boolean>;
  /** Age bracket for coarse priors (privacy-preserving). */
  ageBracket?: "under_18" | "18_24" | "25_34" | "35_44" | "45_54" | "55_plus";
  /** Self-identified gender presentation for merchandising (optional). */
  genderPresentation?: string;
  /** Loyalty identifiers for tier features. */
  loyaltyIds: string[];
  /** Lifetime order count for trust scoring. */
  lifetimeOrderCount: number;
  /** Lifetime return rate point estimate. */
  lifetimeReturnRate: number;
  /** Average order value minor units in home currency. */
  averageOrderValueMinor: number;
  /** Home currency for AOV stats. */
  homeCurrency: string;
  /** Device fingerprints recently seen (hashed). */
  recentDeviceFingerprints: string[];
  /** Last seen channel. */
  lastSeenChannel: "web" | "app" | "store";
  /** ISO timestamp of last activity. */
  lastActiveAt: string;
  /** Communication preferences for interventions. */
  contactPreference: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  /** Risk notes from merchant systems (non-PII codes). */
  merchantRiskCodes: string[];
  /** Whether profile includes verified measurements on file. */
  hasVerifiedMeasurements: boolean;
}

/**
 * Durable memory slice extracted from behavior and explicit preferences.
 */
export interface UserPreferenceMemory {
  /** Owning user id. */
  userId: string;
  /** Tenant id. */
  tenantId: string;
  /** Preferred product categories ranked. */
  categoryAffinities: Array<{ category: ProductCategory; score: number }>;
  /** Brand affinity scores (-1 to 1). */
  brandAffinity: Record<string, number>;
  /** Price band comfort per category (min/max minor units). */
  priceBandComfort: Partial<
    Record<ProductCategory, { minMinor: number; maxMinor: number }>
  >;
  /** Stated sustainability priorities. */
  sustainabilityPriorities: string[];
  /** Fit verbosity preference for explanations. */
  explanationDepth: "minimal" | "standard" | "detailed";
  /** Whether shopper prefers conservative vs fashion-forward picks. */
  styleRiskPosture: "conservative" | "balanced" | "bold";
  /** Size systems the shopper understands (US, EU, UK). */
  familiarSizeSystems: string[];
  /** Last explicit size choices per category for continuity. */
  lastChosenSizesByCategory: Partial<Record<ProductCategory, string>>;
  /** Whether shopper opts into community-informed picks. */
  communityDataOptIn: boolean;
  /** Whether shopper opts into ML personalization. */
  mlPersonalizationOptIn: boolean;
  /** Confidence that preferences are well-estimated. */
  preferenceConfidence: ConfidenceLevel;
  /** ISO timestamp of last memory merge. */
  updatedAt: string;
  /** Source events contributing to memory (aggregate counts only). */
  sourceEventCounts: Record<string, number>;
  /** Optional persona cluster id from segmentation. */
  personaClusterId?: string;
  /** Whether shopper frequently uses wishlist for deliberation. */
  deliberationHeavyShopper: boolean;
}

/**
 * Ephemeral request-scoped context for ranking and clarification.
 */
export interface SessionContext {
  /** Session identifier. */
  sessionId: string;
  /** User id if known. */
  userId?: string;
  /** Tenant id. */
  tenantId: string;
  /** Entry page type for intent priors. */
  entrySurface:
    | "pdp"
    | "search"
    | "collection"
    | "cart"
    | "checkout"
    | "post_purchase";
  /** Device class. */
  deviceClass: "mobile" | "tablet" | "desktop";
  /** Referrer category (search engine, email, social). */
  referrerCategory: string;
  /** Active experiments and variants. */
  activeExperiments: Record<string, string>;
  /** Whether session is in high-intent checkout step. */
  highIntentCheckout: boolean;
  /** Cart value minor units snapshot. */
  cartValueMinor: number;
  /** Cart currency. */
  cartCurrency: string;
  /** Recently viewed product ids (most recent last). */
  recentlyViewedProductIds: string[];
  /** In-session search queries (normalized). */
  recentSearchQueries: string[];
  /** Geo coarse region for shipping estimates. */
  geoRegionHint: string;
  /** Session start timestamp. */
  startedAt: string;
  /** Last interaction timestamp. */
  lastInteractionAt: string;
  /** Whether accessibility reduced motion is requested. */
  prefersReducedMotion: boolean;
  /** Whether session is authenticated. */
  authenticated: boolean;
  /** Customer service escalation flag. */
  escalatedToHuman: boolean;
  /** Language override for this session. */
  languageOverride?: string;
  /** Whether user opened size guide in session. */
  openedSizeGuide: boolean;
  /** Count of recommendation API calls in session (rate limits). */
  recommendationCallCount: number;
}
