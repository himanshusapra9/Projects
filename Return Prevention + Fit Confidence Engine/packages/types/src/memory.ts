/**
 * Typed long-term memory entries, layering (session / user / tenant),
 * decay policies, and preference kinds for the personalization substrate.
 */

import type { ProductCategory } from "./product.js";
import type { ConfidenceLevel } from "./scoring.js";

/**
 * Logical layer where a memory entry resides for isolation and retention policy.
 */
export enum MemoryLayer {
  /** Ephemeral, request- or session-scoped facts. */
  Session = "session",
  /** Durable shopper-specific facts. */
  User = "user",
  /** Tenant-wide priors or merchandising constraints visible to models. */
  Tenant = "tenant",
}

/**
 * Categories of learnable preferences and tendencies stored in memory.
 */
export enum PreferenceType {
  /** Historical size order tendencies by category/brand. */
  SizeTendencies = "size_tendencies",
  /** Subjective fit preferences (slim, relaxed, compression). */
  FitPreferences = "fit_preferences",
  /** Negative outcomes to avoid (scratchy, tight neck, etc.). */
  DislikedOutcomes = "disliked_outcomes",
  /** Patterns in returned products (attributes, reasons). */
  ReturnedProductPatterns = "returned_product_patterns",
  /** Comfort-related preferences (temperature, cushioning). */
  ComfortPreferences = "comfort_preferences",
  /** Brand affinity and trust tendencies. */
  BrandTendencies = "brand_tendencies",
  /** Use-case tags (commute, trail, office, formal). */
  UseCasePreferences = "use_case_preferences",
  /** Risk posture: prefers low-return-probability SKUs even at higher price. */
  LowRiskTendency = "low_risk_tendency",
}

/**
 * Decay schedule for memory salience over time.
 */
export enum MemoryDecayPolicy {
  None = "none",
  /** Exponential half-life in days configured per entry type. */
  Exponential = "exponential",
  /** Step down at fixed horizons. */
  Stepwise = "stepwise",
  /** Reset on contradictory evidence. */
  ContradictionReset = "contradiction_reset",
}

/**
 * Single atomic memory unit with provenance and salience.
 */
export interface MemoryEntry {
  /** Unique memory entry id. */
  entryId: string;
  /** Owning scope id (user id, session id, or tenant id depending on layer). */
  scopeId: string;
  /** Memory layer. */
  layer: MemoryLayer;
  /** Preference category. */
  preferenceType: PreferenceType;
  /** Structured payload (measurement deltas, tags, SKU patterns). */
  payload: Record<string, unknown>;
  /** Salience weight in [0, 1] after decay. */
  salience: number;
  /** Decay policy governing this entry. */
  decayPolicy: MemoryDecayPolicy;
  /** Half-life days if exponential decay applies. */
  decayHalfLifeDays?: number;
  /** Confidence that the memory is accurate. */
  confidence: ConfidenceLevel;
  /** Source event types that created or reinforced this memory. */
  provenanceEventTypes: string[];
  /** ISO timestamp of first observation. */
  firstSeenAt: string;
  /** ISO timestamp of last reinforcement. */
  lastReinforcedAt: string;
  /** Number of reinforcing observations. */
  reinforcementCount: number;
  /** Categories this memory applies to (empty = global). */
  applicableCategories: ProductCategory[];
  /** Contradicting entry ids if any. */
  contradictionEntryIds: string[];
  /** Whether memory was explicitly user-confirmed. */
  userConfirmed: boolean;
  /** Optional expiry for promotional or seasonal memories. */
  expiresAt?: string;
  /** Privacy classification for export/delete compliance. */
  privacyClass: "non_sensitive" | "sensitive" | "restricted";
  /** Tenant id for isolation. */
  tenantId: string;
  /** Schema version for payload migrations. */
  payloadSchemaVersion: number;
  /** Tags for retrieval indexes. */
  retrievalTags: string[];
}
