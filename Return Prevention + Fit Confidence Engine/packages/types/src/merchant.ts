/**
 * Multi-tenant merchant configuration, per-product overrides, and search
 * integration settings for the engine and storefront.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * Tenant-level configuration and entitlements.
 */
export interface MerchantTenant {
  /** Tenant identifier. */
  tenantId: string;
  /** Public display name. */
  displayName: string;
  /** Primary locale for defaults. */
  defaultLocale: string;
  /** Supported locales. */
  supportedLocales: string[];
  /** Default currency for pricing display. */
  defaultCurrency: string;
  /** Enabled product categories carried by the merchant. */
  enabledCategories: ProductCategory[];
  /** Data residency region for compliance. */
  dataResidencyRegion: string;
  /** Feature flags for engine capabilities. */
  featureFlags: Record<string, boolean>;
  /** Rate limits for API tiers (requests per minute). */
  apiRateLimits: Record<string, number>;
  /** Return policy window days baseline. */
  defaultReturnWindowDays: number;
  /** Whether community content is enabled. */
  communityContentEnabled: boolean;
  /** Whether ML personalization is contractually allowed. */
  mlPersonalizationAllowed: boolean;
  /** Brand voice token for narrative generation. */
  brandVoiceToken: string;
  /** Customer support escalation webhook URL (non-PII). */
  supportWebhookUrl?: string;
  /** SLA tier for engine support. */
  supportSlaTier: "standard" | "premium" | "enterprise";
  /** Billing plan code. */
  billingPlanCode: string;
  /** ISO timestamp when tenant record last changed. */
  updatedAt: string;
  /** Sandbox vs production linkage. */
  environment: "sandbox" | "production";
  /** Maximum explanation length characters for PDP. */
  maxExplanationCharacters: number;
  /** Whether tenant allows deterministic replay endpoints. */
  deterministicReplayEnabled: boolean;
  /** Contact emails for operational alerts (non-PII routing). */
  operationalAlertEmails: string[];
  /** Optional sub-merchant hierarchy for marketplaces. */
  childTenantIds?: string[];
}

/**
 * Product-level engine and merchandising configuration overrides.
 */
export interface ProductConfig {
  /** Product id. */
  productId: string;
  /** Tenant id. */
  tenantId: string;
  /** Whether automated size guidance is enabled for this SKU family. */
  sizeGuidanceEnabled: boolean;
  /** Forced size chart id override. */
  forcedChartId?: string;
  /** Manual risk multipliers for fragile categories. */
  returnRiskMultipliers: Record<string, number>;
  /** Merchant-authored fit notes surfaced to model and UI. */
  merchantFitNotes: string[];
  /** Blacklisted variant SKUs from recommendations. */
  recommendationBlocklistSkus: string[];
  /** Minimum confidence required to show community section. */
  minimumCommunityConfidence: ConfidenceLevel;
  /** Whether to prefer conservative picks. */
  conservativeBias: number;
  /** Custom intervention templates enabled. */
  interventionTemplateIds: string[];
  /** Whether virtual try-on assets exist. */
  virtualTryOnAvailable: boolean;
  /** Compliance mode for regulated goods. */
  complianceMode: "none" | "beauty" | "electronics" | "children";
  /** Cross-sell product ids boosted in alternatives rail. */
  merchandisingBoostProductIds: string[];
  /** ISO timestamp when config last updated. */
  updatedAt: string;
  /** Authoring user or system id. */
  lastUpdatedBy: string;
  /** A/B test overrides for this product. */
  experimentOverrides: Record<string, string>;
  /** Whether PDP should emphasize sustainability claims. */
  sustainabilityEmphasis: boolean;
  /** Maximum number of alternatives to expose. */
  maxAlternativesShown: number;
  /** Language-specific disclaimer overrides. */
  disclaimerOverridesByLocale?: Record<string, string[]>;
  /** Warranty metadata URL for electronics/furniture. */
  warrantyInfoUrl?: string;
}

/**
 * Search stack configuration for catalog and vector indices.
 */
export interface SearchConfig {
  /** Tenant id. */
  tenantId: string;
  /** Primary search provider key. */
  provider: "elasticsearch" | "opensearch" | "algolia" | "custom";
  /** Index name for products. */
  productIndexName: string;
  /** Index name for reviews if separate. */
  reviewIndexName?: string;
  /** Vector index name for semantic search if used. */
  vectorIndexName?: string;
  /** Default locale analyzer. */
  defaultAnalyzer: string;
  /** Per-locale analyzer overrides. */
  analyzerOverridesByLocale: Record<string, string>;
  /** Synonym map id version. */
  synonymMapVersion: string;
  /** Boost weights for ranking. */
  rankingBoosts: Record<string, number>;
  /** Facets exposed in API. */
  exposedFacetKeys: string[];
  /** Minimum should match for fuzzy queries. */
  fuzzyMinShouldMatch: string;
  /** Whether personalization re-ranking is enabled. */
  personalizationRerankEnabled: boolean;
  /** Cache TTL seconds for hot queries. */
  cacheTtlSeconds: number;
  /** Query timeout milliseconds. */
  queryTimeoutMs: number;
  /** Whether inventory filters are enforced in search. */
  inventoryFilterEnforced: boolean;
  /** Region-specific index routing keys. */
  regionRoutingMap: Record<string, string>;
  /** ISO timestamp when config deployed. */
  deployedAt: string;
  /** Feature flags for search experiments. */
  searchFeatureFlags: Record<string, boolean>;
  /** Maximum offset for pagination (deep pagination guard). */
  maxPaginationOffset: number;
  /** Whether to log queries for quality review (privacy policy gated). */
  queryLoggingEnabled: boolean;
  /** Embedding model id if vector search enabled. */
  embeddingModelId?: string;
  /** Hybrid lexical-vector weight if both used. */
  hybridVectorWeight?: number;
}
