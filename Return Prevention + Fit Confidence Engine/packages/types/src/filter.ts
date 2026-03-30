/**
 * Faceted search state, refinement chips, static filter definitions, and
 * dynamic filters driven by inventory or shopper context.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * Serializable filter state for PLP, search, and recommendation refinement.
 */
export interface FilterState {
  /** State identifier for URL sync / persistence. */
  stateId: string;
  /** Tenant scope. */
  tenantId: string;
  /** Session or user scope for personalization overlays. */
  scopeId?: string;
  /** Selected category facets. */
  categories: ProductCategory[];
  /** Brand keys selected. */
  brands: string[];
  /** Price range in minor units (inclusive). */
  priceRangeMinor: { min: number; max: number };
  /** Currency for price range. */
  currency: string;
  /** Size labels selected (normalized). */
  sizes: string[];
  /** Color tokens selected. */
  colors: string[];
  /** Material or fabric tags. */
  materials: string[];
  /** Free-text query combined with facets. */
  queryText?: string;
  /** Dynamic facet buckets with counts from last search response. */
  dynamicFacetBuckets: Record<string, Array<{ value: string; count: number }>>;
  /** Sort key applied. */
  sortKey:
    | "relevance"
    | "price_asc"
    | "price_desc"
    | "newest"
    | "best_seller"
    | "return_rate_asc";
  /** In-stock only flag. */
  inStockOnly: boolean;
  /** Same-day pickup eligible. */
  sameDayPickup: boolean;
  /** Sustainability tags. */
  sustainabilityTags: string[];
  /** Merchant-specific extension facets. */
  extensionFacets: Record<string, string[]>;
  /** ISO timestamp when state was last updated. */
  updatedAt: string;
  /** Whether state originated from engine suggestion. */
  engineSuggested: boolean;
  /** Confidence that filters match shopper intent. */
  intentAlignmentConfidence: ConfidenceLevel;
  /** Result count from last application (cached). */
  lastResultCount?: number;
  /** Geo or store scoping for availability filters. */
  fulfillmentNodeId?: string;
}

/**
 * UI chip representing an active or suggested refinement.
 */
export interface RefinementChip {
  /** Chip identifier. */
  chipId: string;
  /** Display label. */
  label: string;
  /** Underlying filter key. */
  filterKey: string;
  /** Value token. */
  value: string;
  /** Whether chip is currently applied. */
  applied: boolean;
  /** Whether chip is suggested by engine vs user-created. */
  suggested: boolean;
  /** Priority for horizontal ordering. */
  priority: number;
  /** Icon token for UI kits. */
  iconToken?: string;
  /** Removable by user interaction. */
  removable: boolean;
  /** Tooltip explaining impact on fit/risk. */
  tooltip?: string;
  /** Whether applying removes inventory conflicts. */
  resolvesInventoryConflict: boolean;
  /** Analytics tag. */
  telemetryTag: string;
  /** Badge text (e.g., "Low return rate"). */
  badgeText?: string;
  /** Styling variant. */
  variant: "neutral" | "positive" | "warning" | "accent";
  /** ISO timestamp when chip was generated. */
  generatedAt: string;
  /** Whether chip is locked by merchant campaign. */
  campaignLocked: boolean;
  /** Deep link to apply in storefront router. */
  applyHref?: string;
  /** Expected confidence delta if applied. */
  expectedConfidenceDelta?: number;
}

/**
 * Catalog schema for a filterable facet.
 */
export interface FilterDefinition {
  /** Facet key used in APIs and URLs. */
  facetKey: string;
  /** Human title. */
  displayName: string;
  /** Value type for validation. */
  valueType: "string" | "number" | "boolean" | "enum" | "range";
  /** Allowed enum values when applicable. */
  enumValues?: string[];
  /** Whether facet is multi-select. */
  multiSelect: boolean;
  /** Categories where facet applies; empty means all. */
  applicableCategories: ProductCategory[];
  /** Whether facet participates in fit engine refinements. */
  usedInFitRefinement: boolean;
  /** Inventory dependency (dynamic counts). */
  inventoryDependent: boolean;
  /** Sort order in UI. */
  uiSortOrder: number;
  /** Whether facet is exposed to external partners. */
  publicApiExposed: boolean;
  /** Elasticsearch field mapping name. */
  searchIndexField: string;
  /** Default expansion state in UI. */
  defaultExpanded: boolean;
  /** Help text for shoppers. */
  helpText?: string;
  /** Whether facet requires entitlement for premium brands. */
  entitlementGated: boolean;
  /** Telemetry namespace. */
  analyticsNamespace: string;
  /** Deprecation flag for migrations. */
  deprecated: boolean;
  /** Replacement facet key if deprecated. */
  replacedByFacetKey?: string;
  /** ISO timestamp when definition last changed. */
  lastUpdatedAt: string;
}

/**
 * Runtime-computed filter with predicates and refresh cadence.
 */
export interface DynamicFilter {
  /** Dynamic filter identifier. */
  dynamicFilterId: string;
  /** Owning tenant. */
  tenantId: string;
  /** Predicate expression in safe DSL or JSON logic. */
  predicate: string;
  /** Human label for UI when surfaced. */
  displayLabel: string;
  /** Refresh interval seconds for recomputation. */
  refreshIntervalSeconds: number;
  /** Last evaluation timestamp. */
  lastEvaluatedAt: string;
  /** Whether evaluation failed last run. */
  lastEvaluationFailed: boolean;
  /** Dependencies on inventory feeds or pricing jobs. */
  upstreamDependencyTags: string[];
  /** Categories where filter is eligible. */
  categories: ProductCategory[];
  /** Whether filter can narrow recommendations API. */
  usableInRecommendations: boolean;
  /** Priority when multiple dynamic filters overlap. */
  priority: number;
  /** Owner team for operations. */
  ownerTeam: string;
  /** Risk level if misconfigured (merchandising impact). */
  misconfigurationRisk: "low" | "medium" | "high";
  /** Whether filter requires real-time inventory graph. */
  requiresRealtimeInventory: boolean;
  /** Feature flag gating evaluation. */
  featureFlagKey?: string;
  /** Sample rate for expensive predicates. */
  evaluationSampleRate: number;
  /** ISO timestamp when definition created. */
  createdAt: string;
  /** Optional description for internal docs. */
  description?: string;
  /** Version for backward compatibility. */
  schemaVersion: number;
}
