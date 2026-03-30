/**
 * Behavioral preference inference with explicit vs inferred and stability heuristics.
 */

import type { ProductCategory } from "@return-prevention/types";
import type { BehaviorEvent } from "@return-prevention/types";
import { ReturnReason } from "@return-prevention/types";

export type PreferenceStrength = "weak" | "medium" | "strong";
export type PreferenceStability = "temporary" | "stable";

export interface InferredPreference {
  key: string;
  value: unknown;
  category?: ProductCategory;
  source: "explicit" | "inferred";
  strength: PreferenceStrength;
  stability: PreferenceStability;
  evidenceCount: number;
  lastSeenAt: string;
}

function maxDate(isoDates: string[]): string {
  return isoDates.reduce((a, b) => (a > b ? a : b));
}

/**
 * Extracts preferences from ordered behavior streams using frequency and intent heuristics.
 */
export class PreferenceExtractor {
  /**
   * @param events - Chronological behavior events for one user/session.
   */
  extractFromBehavior(events: BehaviorEvent[]): InferredPreference[] {
    const bySize = new Map<string, number>();
    const returnsByBucket = new Map<string, number>();
    const viewsByCat = new Map<ProductCategory, number>();
    const sizingReturnReasons = new Set<ReturnReason>([
      ReturnReason.SizeTooSmall,
      ReturnReason.SizeTooLarge,
      ReturnReason.FitNotFlattering,
      ReturnReason.ComfortMismatch,
    ]);

    for (const e of events) {
      if (e.type === "variant_selected") {
        const token = e.toSku.split(/[-_]/).pop() ?? e.toSku;
        bySize.set(token, (bySize.get(token) ?? 0) + 1);
      }
      if (e.type === "product_viewed") {
        viewsByCat.set(e.category, (viewsByCat.get(e.category) ?? 0) + 1);
      }
      if (e.type === "return_initiated") {
        const bucket = sizingReturnReasons.has(e.reason) ? "sizing_and_fit" : "non_sizing";
        returnsByBucket.set(bucket, (returnsByBucket.get(bucket) ?? 0) + 1);
      }
    }

    const out: InferredPreference[] = [];
    const now = events.length ? maxDate(events.map((ev) => ev.occurredAt)) : new Date().toISOString();

    for (const e of events) {
      if (e.type === "clarification_answered") {
        const fit = e.answerPayload["fit_intent"];
        if (typeof fit === "string") {
          out.push({
            key: "clarification_fit_intent",
            value: fit,
            source: "explicit",
            strength: "strong",
            stability: "stable",
            evidenceCount: 1,
            lastSeenAt: e.occurredAt,
          });
        }
      }
    }

    let topSize: [string, number] | null = null;
    for (const [k, v] of bySize) {
      if (!topSize || v > topSize[1]) topSize = [k, v];
    }
    if (topSize && topSize[1] >= 3) {
      out.push({
        key: "size_token_mode",
        value: topSize[0],
        source: "inferred",
        strength: topSize[1] >= 6 ? "strong" : "medium",
        stability: topSize[1] >= 6 ? "stable" : "temporary",
        evidenceCount: topSize[1],
        lastSeenAt: now,
      });
    }

    const totalViews = [...viewsByCat.values()].reduce((a, b) => a + b, 0) || 1;
    for (const [bucket, r] of returnsByBucket) {
      const rate = r / (totalViews * 0.15 + 3);
      if (rate > 0.2) {
        out.push({
          key: "return_stress_bucket",
          value: { bucket, rate },
          source: "inferred",
          strength: rate > 0.45 ? "strong" : "medium",
          stability: "stable",
          evidenceCount: r,
          lastSeenAt: now,
        });
      }
    }

    let topCat: [ProductCategory, number] | null = null;
    for (const [c, v] of viewsByCat) {
      if (!topCat || v > topCat[1]) topCat = [c, v];
    }
    if (topCat && topCat[1] >= 4) {
      out.push({
        key: "dominant_browse_category",
        value: topCat[0],
        category: topCat[0],
        source: "inferred",
        strength: topCat[1] >= 10 ? "strong" : "medium",
        stability: "temporary",
        evidenceCount: topCat[1],
        lastSeenAt: now,
      });
    }

    return out;
  }
}
