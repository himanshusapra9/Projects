/**
 * In-memory layered preference store with decay, merge, and scoped recall.
 */

import type { Product, ProductCategory } from "@return-prevention/types";
import {
  MemoryDecayPolicy,
  MemoryLayer,
  PreferenceType,
  type MemoryEntry,
} from "@return-prevention/types";
import { ConfidenceLevel } from "@return-prevention/types";

export interface StorablePreference {
  preferenceType: PreferenceType;
  payload: Record<string, unknown>;
  applicableCategories: ProductCategory[];
  confidence: ConfidenceLevel;
  userConfirmed?: boolean;
  retrievalTags?: string[];
}

export type MemoryScope = "session" | "user" | "tenant";

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}

function scoreTagOverlap(tags: string[], product: Product): number {
  const facet = new Set(product.searchFacetKeys);
  let hit = 0;
  for (const t of tags) if (facet.has(t) || product.title.toLowerCase().includes(t.toLowerCase())) hit++;
  return tags.length ? hit / tags.length : 0.5;
}

function categoryOverlap(cats: ProductCategory[], product: Product): number {
  if (cats.length === 0) return 1;
  return cats.includes(product.category) ? 1 : 0.25;
}

/**
 * Layered memory with reinforcement, decay, and conflict-aware merge.
 */
export class MemoryService {
  private readonly entries = new Map<string, MemoryEntry[]>();

  private key(scope: MemoryScope, scopeId: string): string {
    return `${scope}:${scopeId}`;
  }

  /**
   * Retrieve all memory entries for a session.
   */
  getSessionMemory(sessionId: string): MemoryEntry[] {
    return [...(this.entries.get(this.key("session", sessionId)) ?? [])];
  }

  /**
   * Retrieve user-scoped durable memory.
   */
  getUserMemory(userId: string): MemoryEntry[] {
    return [...(this.entries.get(this.key("user", userId)) ?? [])];
  }

  /**
   * Tenant-level priors and constraints.
   */
  getTenantMemory(tenantId: string): MemoryEntry[] {
    return [...(this.entries.get(this.key("tenant", tenantId)) ?? [])];
  }

  /**
   * Upsert a preference for a user with reinforcement semantics.
   */
  storePreference(userId: string, pref: StorablePreference, tenantId: string): MemoryEntry {
    const k = this.key("user", userId);
    const list = this.entries.get(k) ?? [];
    const entry: MemoryEntry = {
      entryId: randomId("mem"),
      scopeId: userId,
      layer: MemoryLayer.User,
      preferenceType: pref.preferenceType,
      payload: pref.payload,
      salience: this.confidenceToSalience(pref.confidence),
      decayPolicy: MemoryDecayPolicy.Exponential,
      decayHalfLifeDays: 120,
      confidence: pref.confidence,
      provenanceEventTypes: ["explicit_store"],
      firstSeenAt: nowIso(),
      lastReinforcedAt: nowIso(),
      reinforcementCount: 1,
      applicableCategories: pref.applicableCategories,
      contradictionEntryIds: [],
      userConfirmed: pref.userConfirmed ?? false,
      privacyClass: "non_sensitive",
      tenantId,
      payloadSchemaVersion: 1,
      retrievalTags: pref.retrievalTags ?? [],
    };
    list.push(entry);
    this.entries.set(k, list);
    return entry;
  }

  /**
   * Recall preferences relevant to the current product (tag/category gating).
   */
  recallRelevantPreferences(userId: string, productContext: Product): MemoryEntry[] {
    const all = this.getUserMemory(userId);
    const ranked = all
      .map((e) => ({
        e,
        rel:
          0.55 * categoryOverlap(e.applicableCategories, productContext) +
          0.35 * scoreTagOverlap(e.retrievalTags, productContext) +
          0.1 * e.salience,
      }))
      .filter((x) => x.rel > 0.2)
      .sort((a, b) => b.rel - a.rel);
    return ranked.map((x) => x.e);
  }

  /**
   * Apply exponential decay by elapsed time since last reinforcement.
   */
  decayStalePreferences(userId: string, referenceTime = new Date()): void {
    const k = this.key("user", userId);
    const list = this.entries.get(k);
    if (!list) return;
    for (const e of list) {
      if (e.decayPolicy !== MemoryDecayPolicy.Exponential || !e.decayHalfLifeDays) continue;
      const last = new Date(e.lastReinforcedAt).getTime();
      const days = (referenceTime.getTime() - last) / 86400000;
      const half = e.decayHalfLifeDays;
      e.salience = Math.max(0.05, e.salience * Math.pow(0.5, days / half));
    }
  }

  /**
   * Merge a new observation with an existing entry; resolve conflicts by confidence + recency.
   */
  mergePreferences(existing: MemoryEntry, incoming: StorablePreference): MemoryEntry {
    const confOrder: ConfidenceLevel[] = [
      ConfidenceLevel.VeryLow,
      ConfidenceLevel.Low,
      ConfidenceLevel.Medium,
      ConfidenceLevel.High,
      ConfidenceLevel.VeryHigh,
    ];
    const rank = (c: ConfidenceLevel) => confOrder.indexOf(c);

    const mergedPayload = { ...existing.payload };
    for (const [k, v] of Object.entries(incoming.payload)) {
      const prev = mergedPayload[k];
      if (prev === undefined) {
        mergedPayload[k] = v;
      } else if (rank(incoming.confidence) >= rank(existing.confidence)) {
        mergedPayload[k] = v;
      }
    }

    return {
      ...existing,
      payload: mergedPayload,
      lastReinforcedAt: nowIso(),
      reinforcementCount: existing.reinforcementCount + 1,
      confidence:
        rank(incoming.confidence) >= rank(existing.confidence)
          ? incoming.confidence
          : existing.confidence,
      salience: Math.min(1, existing.salience + 0.08),
    };
  }

  /**
   * Clear memory for a user; scope narrows what is removed.
   */
  clearMemory(
    userId: string,
    scope: "session" | "user" | "all",
    sessionId?: string,
  ): void {
    if (scope === "session" && sessionId) {
      this.entries.delete(this.key("session", sessionId));
    }
    if (scope === "user" || scope === "all") {
      this.entries.delete(this.key("user", userId));
    }
  }

  /**
   * Infer implicit preference updates from recent behavior (wrapper for batch jobs).
   */
  inferPreferencesFromBehaviorPattern(params: {
    userId: string;
    tenantId: string;
    dominantCategories: ProductCategory[];
    repeatedSizeToken?: string;
    returnRateByCategory: Record<string, number>;
  }): MemoryEntry[] {
    const out: MemoryEntry[] = [];
    if (params.repeatedSizeToken) {
      out.push(
        this.storePreference(
          params.userId,
          {
            preferenceType: PreferenceType.SizeTendencies,
            payload: { preferredLabel: params.repeatedSizeToken, source: "inferred_repeat" },
            applicableCategories: params.dominantCategories,
            confidence: ConfidenceLevel.Medium,
            userConfirmed: false,
            retrievalTags: ["size", params.repeatedSizeToken],
          },
          params.tenantId,
        ),
      );
    }
    for (const [cat, rate] of Object.entries(params.returnRateByCategory)) {
      if (rate > 0.35) {
        out.push(
          this.storePreference(
            params.userId,
            {
              preferenceType: PreferenceType.ReturnedProductPatterns,
              payload: { category: cat, high_return_rate: rate },
              applicableCategories: [cat as ProductCategory],
              confidence: ConfidenceLevel.Low,
              retrievalTags: ["returns", cat],
            },
            params.tenantId,
          ),
        );
      }
    }
    return out;
  }

  private confidenceToSalience(c: ConfidenceLevel): number {
    switch (c) {
      case ConfidenceLevel.VeryHigh:
        return 1;
      case ConfidenceLevel.High:
        return 0.85;
      case ConfidenceLevel.Medium:
        return 0.65;
      case ConfidenceLevel.Low:
        return 0.45;
      default:
        return 0.3;
    }
  }
}
