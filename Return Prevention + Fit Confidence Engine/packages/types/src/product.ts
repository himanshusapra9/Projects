/**
 * Product catalog structures, variants, category-specific profiles, sizing,
 * inventory, and commercial pricing primitives.
 */

import type { ConfidenceLevel } from "./scoring.js";

/**
 * Supported high-level merchandising categories for specialized fit and risk models.
 */
export enum ProductCategory {
  Apparel = "apparel",
  Footwear = "footwear",
  Furniture = "furniture",
  Beauty = "beauty",
  TravelGear = "travel_gear",
  HomeGoods = "home_goods",
  Accessories = "accessories",
  Electronics = "electronics",
}

/**
 * Single attribute facet on a product or variant (material, color, rise, etc.).
 */
export interface ProductAttribute {
  /** Namespace for grouping (e.g., "fabric", "finish"). */
  namespace: string;
  /** Machine key for rules and search. */
  key: string;
  /** Display label for storefronts. */
  displayLabel: string;
  /** Normalized value for matching (canonical string). */
  normalizedValue: string;
  /** Raw vendor value before normalization. */
  rawValue: string;
  /** Unit when numeric (e.g., "g", "oz"). */
  unit?: string;
  /** Whether this attribute influences fit models. */
  affectsFitModel: boolean;
  /** Whether this attribute influences return risk. */
  affectsReturnRisk: boolean;
  /** Confidence that extraction/ingestion is correct. */
  extractionConfidence: ConfidenceLevel;
  /** Source system field path for traceability. */
  sourcePath: string;
  /** Last updated timestamp (ISO 8601). */
  updatedAt: string;
  /** Optional synonym list for query expansion. */
  synonyms?: string[];
}

/**
 * Sellable SKU with inventory, pricing, and attribute slice.
 */
export interface ProductVariant {
  /** Merchant SKU identifier. */
  sku: string;
  /** Parent product identifier. */
  productId: string;
  /** Human title including size/color where applicable. */
  title: string;
  /** GTIN / UPC if available. */
  globalTradeItemNumber?: string;
  /** Variant-level attributes (size, width, inseam, color). */
  attributes: ProductAttribute[];
  /** Primary image URL for this variant. */
  primaryImageUrl?: string;
  /** Whether variant is digitally fulfillable only. */
  digitalFulfillmentOnly: boolean;
  /** Hazmat or shipping constraint flags. */
  shippingConstraints: string[];
  /** Weight in grams for logistics risk models. */
  weightGrams?: number;
  /** Dimensional shipping class (parcel vs LTL). */
  dimensionalShippingClass: "parcel" | "oversized" | "freight";
  /** Lifecycle state for recommendation eligibility. */
  lifecycleState: "active" | "discontinued" | "seasonal_hold";
  /** ISO timestamp when variant metadata last synced. */
  lastIngestedAt: string;
}

/**
 * Canonical row in a merchant or brand-merged size chart.
 */
export interface SizeChartRow {
  /** Row key used for joins (e.g., brand size token). */
  rowKey: string;
  /** Map of measurement column id → numeric value in base unit. */
  measurements: Record<string, number>;
  /** Region-specific label shown to shoppers. */
  regionLabel: string;
  /** Fit intent (e.g., slim vs relaxed) if encoded in chart. */
  fitIntent?: string;
}

/**
 * Size chart with multi-region and measurement-axis definitions.
 */
export interface SizeChart {
  /** Unique chart identifier. */
  chartId: string;
  /** Owning brand or private-label key. */
  brandKey: string;
  /** Category this chart applies to. */
  category: ProductCategory;
  /** Measurement columns (chest, waist, foot_length_cm, etc.). */
  columnDefinitions: Array<{
    columnId: string;
    displayName: string;
    unit: string;
    /** Whether larger numbers imply larger garment/footwear size. */
    monotonicDirection: "up" | "down";
  }>;
  /** Region-specific rows (US/EU/UK). */
  rowsByRegion: Record<string, SizeChartRow[]>;
  /** Version for drift detection across ingests. */
  version: string;
  /** Effective date for seasonal chart changes. */
  effectiveFrom: string;
  /** Whether chart is authoritative vs advisory for the tenant. */
  bindingPolicy: "authoritative" | "advisory";
  /** Notes for models about stretch vs rigid fabrics. */
  fabricContextNotes?: string;
  /** ISO timestamp when chart was indexed. */
  indexedAt: string;
}

/**
 * Inventory snapshot for a variant or node in the fulfillment graph.
 */
export interface Inventory {
  /** SKU or variant reference. */
  sku: string;
  /** Warehouse or store node identifier. */
  nodeId: string;
  /** Available sellable units. */
  quantityAvailable: number;
  /** Reserved against open orders. */
  quantityReserved: number;
  /** Incoming PO quantity if known. */
  quantityInbound?: number;
  /** Safety stock threshold for recommendation gating. */
  safetyStockThreshold: number;
  /** Whether backorder is allowed for this node/SKU. */
  backorderAllowed: boolean;
  /** Expected restock date if out of stock. */
  expectedRestockDate?: string;
  /** Multi-channel eligibility flags. */
  channels: Array<"web" | "app" | "store" | "marketplace">;
  /** Lot or batch constraints (expiry for beauty). */
  lotConstraints?: string[];
  /** Last inventory feed timestamp. */
  updatedAt: string;
  /** Confidence in feed accuracy for risk models. */
  feedReliabilityScore: number;
}

/**
 * Commercial price representation with promos and currency.
 */
export interface Price {
  /** ISO 4217 currency code. */
  currency: string;
  /** List price in minor units (cents). */
  listAmountMinor: number;
  /** Sale price if applicable (minor units). */
  saleAmountMinor?: number;
  /** Effective price after best eligible promo. */
  effectiveAmountMinor: number;
  /** Tax behavior hint for display only. */
  taxInclusive: boolean;
  /** Price validity window. */
  validFrom: string;
  validTo?: string;
  /** Promo codes or mechanisms applied. */
  appliedPromotions: Array<{
    promotionId: string;
    description: string;
    discountMinor: number;
  }>;
  /** Comparative reference price for value perception models. */
  strikethroughReferenceMinor?: number;
  /** Whether dynamic pricing is active. */
  dynamicPricingActive: boolean;
  /** Region or market key for the price list. */
  marketKey: string;
  /** Last pricing engine update. */
  updatedAt: string;
}

/**
 * Category-specific modeling and policy metadata layered on {@link ProductCategory}.
 */
export interface CategoryProfile {
  /** Category key. */
  category: ProductCategory;
  /** Primary measurement axes used in models for this category. */
  primaryMeasurementAxes: string[];
  /** Secondary axes for cross-checks. */
  secondaryMeasurementAxes: string[];
  /** Default size chart identifiers preferred for the tenant. */
  defaultChartIds: string[];
  /** Return reason priors baseline for cold start. */
  returnReasonPriors: Record<string, number>;
  /** Whether virtual try-on signals exist for this category. */
  supportsVirtualTryOn: boolean;
  /** Whether community fit signals are considered high value. */
  communitySignalImportance: number;
  /** Fragility multiplier for logistics-related returns. */
  logisticsFragilityWeight: number;
  /** Minimum data quality score to enable auto recommendations. */
  minimumDataQualityThreshold: number;
  /** Category-specific intervention templates. */
  interventionTemplateIds: string[];
  /** Seasonality tags affecting risk (e.g., holiday gifting). */
  seasonalityTags: string[];
  /** ISO timestamp when profile was authored. */
  profileVersionedAt: string;
  /** Optional regulatory flags (beauty, electronics). */
  regulatoryFlags?: string[];
}

/**
 * Top-level product aggregate linking variants, attributes, and merchandising context.
 */
export interface Product {
  /** Stable product identifier in merchant catalog. */
  productId: string;
  /** Merchant tenant owning the product. */
  tenantId: string;
  /** Display title. */
  title: string;
  /** Long description for NLP features. */
  description: string;
  /** High-level category. */
  category: ProductCategory;
  /** Product-level attributes (style, collection, gender target). */
  attributes: ProductAttribute[];
  /** All sellable variants. */
  variants: ProductVariant[];
  /** Category profile snapshot used during indexing. */
  categoryProfile: CategoryProfile;
  /** Size charts applicable to this product (ordered by precedence). */
  sizeCharts: SizeChart[];
  /** Default variant SKU when ambiguous. */
  defaultVariantSku?: string;
  /** Search facets derived for filtering. */
  searchFacetKeys: string[];
  /** Content quality score from ingestion pipeline. */
  contentQualityScore: number;
  /** Whether product is part of a bundle or configurable SKU. */
  bundleDescriptor?: {
    bundleId: string;
    componentProductIds: string[];
  };
  /** ISO timestamp for last full product reindex. */
  lastIndexedAt: string;
  /** Merchant merchandising labels (new arrival, evergreen). */
  merchandisingLabels: string[];
  /** Compliance and safety URLs (electronics, furniture). */
  complianceDocumentUrls?: string[];
}
