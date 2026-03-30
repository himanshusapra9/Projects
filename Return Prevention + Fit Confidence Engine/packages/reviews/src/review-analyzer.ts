/**
 * Lexicon-driven review analysis with category-specific aggregation.
 */

import type { ProductCategory } from "@return-prevention/types";
import type { Review } from "@return-prevention/types";
import { ConfidenceLevel } from "@return-prevention/types";

export type FitSignalKey =
  | "runs_small"
  | "runs_large"
  | "narrow"
  | "wide"
  | "comfortable"
  | "uncomfortable";

export type QualitySignalKey = "durable" | "fragile" | "premium_feel" | "cheap_feel";

export type MaintenanceSignalKey =
  | "easy_clean"
  | "hard_clean"
  | "easy_assembly"
  | "hard_assembly";

export interface SignalAggregate {
  score: number;
  mass: number;
  confidence: ConfidenceLevel;
  supportingReviewIds: string[];
}

export interface ReviewIntelligence {
  productId: string;
  reviewCount: number;
  averageStars: number;
  fitSignals: Record<FitSignalKey, SignalAggregate>;
  qualitySignals: Record<QualitySignalKey, SignalAggregate>;
  maintenanceSignals: Record<MaintenanceSignalKey, SignalAggregate>;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    confidence: ConfidenceLevel;
  };
  category: ProductCategory;
}

const FIT_LEXICON: Record<FitSignalKey, RegExp[]> = {
  runs_small: [/runs?\s+small/i, /size\s+down/i, /order\s+(a |one )?size\s+up/i],
  runs_large: [/runs?\s+large/i, /size\s+up/i, /order\s+(a |one )?size\s+down/i],
  narrow: [/\bnarrow\b/i, /too\s+tight/i, /pinch(?:es)?/i],
  wide: [/\bwide\b/i, /roomy/i, /too\s+loose/i],
  comfortable: [/comfortable/i, /cozy/i, /soft\b/i],
  uncomfortable: [/uncomfortable/i, /itchy/i, /rubs?/i],
};

const QUALITY_LEXICON: Record<QualitySignalKey, RegExp[]> = {
  durable: [/durable/i, /held\s+up/i, /lasted/i],
  fragile: [/fragile/i, /broke/i, /fell\s+apart/i],
  premium_feel: [/premium/i, /high[\s-]?quality/i, /luxury/i],
  cheap_feel: [/cheap/i, /flimsy/i, /thin\s+material/i],
};

const MAINT_LEXICON: Record<MaintenanceSignalKey, RegExp[]> = {
  easy_clean: [/easy\s+to\s+clean/i, /wipes?\s+off/i, /machine\s+wash/i],
  hard_clean: [/stains?/i, /hard\s+to\s+clean/i],
  easy_assembly: [/easy\s+assembly/i, /\bminutes\s+to\s+assemble/i],
  hard_assembly: [/difficult\s+assembly/i, /missing\s+parts/i, /instructions/i],
};

function starWeight(stars: number): number {
  if (stars <= 2) return 1.35;
  if (stars === 3) return 1;
  return 0.75;
}

function confidenceFromN(n: number, strength: number): ConfidenceLevel {
  const s = Math.log1p(n) * Math.min(1, Math.abs(strength));
  if (s >= 2.5) return ConfidenceLevel.High;
  if (s >= 1.4) return ConfidenceLevel.Medium;
  if (s >= 0.7) return ConfidenceLevel.Low;
  return ConfidenceLevel.VeryLow;
}

/**
 * Mines review text for fit, quality, and maintenance signals with weighted aggregation.
 */
export class ReviewAnalyzer {
  /**
   * @param reviews - Reviews for a single product or variant cluster.
   * @param category - Merchandising category for optional emphasis.
   */
  analyzeReviews(reviews: Review[], category: ProductCategory): ReviewIntelligence {
    const productId = reviews[0]?.productId ?? "unknown";
    const n = reviews.length;
    let starSum = 0;
    for (const r of reviews) starSum += r.starRating;
    const averageStars = n ? starSum / n : 0;

    const fitHits: Record<FitSignalKey, { w: number; ids: string[] }> = {
      runs_small: { w: 0, ids: [] },
      runs_large: { w: 0, ids: [] },
      narrow: { w: 0, ids: [] },
      wide: { w: 0, ids: [] },
      comfortable: { w: 0, ids: [] },
      uncomfortable: { w: 0, ids: [] },
    };
    const qualHits: Record<QualitySignalKey, { w: number; ids: string[] }> = {
      durable: { w: 0, ids: [] },
      fragile: { w: 0, ids: [] },
      premium_feel: { w: 0, ids: [] },
      cheap_feel: { w: 0, ids: [] },
    };
    const maintHits: Record<MaintenanceSignalKey, { w: number; ids: string[] }> = {
      easy_clean: { w: 0, ids: [] },
      hard_clean: { w: 0, ids: [] },
      easy_assembly: { w: 0, ids: [] },
      hard_assembly: { w: 0, ids: [] },
    };

    let pos = 0;
    let neg = 0;
    let neu = 0;

    for (const r of reviews) {
      const text = `${r.title ?? ""}\n${r.body}`;
      const w = starWeight(r.starRating) * (r.verifiedPurchase ? 1.12 : 0.92);
      if (r.starRating >= 4) pos += w;
      else if (r.starRating <= 2) neg += w;
      else neu += w;

      for (const key of Object.keys(FIT_LEXICON) as FitSignalKey[]) {
        if (FIT_LEXICON[key].some((rx) => rx.test(text))) {
          fitHits[key].w += w;
          fitHits[key].ids.push(r.reviewId);
        }
      }
      if (category === "furniture" || category === "home_goods") {
        for (const key of Object.keys(MAINT_LEXICON) as MaintenanceSignalKey[]) {
          if (MAINT_LEXICON[key].some((rx) => rx.test(text))) {
            maintHits[key].w += w;
            maintHits[key].ids.push(r.reviewId);
          }
        }
      }
      for (const key of Object.keys(QUALITY_LEXICON) as QualitySignalKey[]) {
        if (QUALITY_LEXICON[key].some((rx) => rx.test(text))) {
          qualHits[key].w += w;
          qualHits[key].ids.push(r.reviewId);
        }
      }
    }

    const normFit = this.normalizeFamily(fitHits, n);
    const normQual = this.normalizeFamily(qualHits, n);
    const normMaint = this.normalizeFamily(maintHits, n);

    const total = pos + neg + neu || 1;
    const sentimentConf = confidenceFromN(n, Math.max(pos, neg) / total);

    return {
      productId,
      reviewCount: n,
      averageStars,
      fitSignals: normFit as ReviewIntelligence["fitSignals"],
      qualitySignals: normQual as ReviewIntelligence["qualitySignals"],
      maintenanceSignals: normMaint as ReviewIntelligence["maintenanceSignals"],
      sentiment: {
        positive: pos / total,
        negative: neg / total,
        neutral: neu / total,
        confidence: sentimentConf,
      },
      category,
    };
  }

  private normalizeFamily<T extends string>(
    hits: Record<T, { w: number; ids: string[] }>,
    n: number,
  ): Record<T, SignalAggregate> {
    const out = {} as Record<T, SignalAggregate>;
    const keys = Object.keys(hits) as T[];
    let sumW = 0;
    for (const k of keys) sumW += hits[k].w;
    sumW = sumW || 1;
    for (const k of keys) {
      const h = hits[k];
      const mass = h.w / sumW;
      const score = Math.min(1, (h.w / (n + 3)) * 2);
      out[k] = {
        score,
        mass: mass * 2 - 1,
        confidence: confidenceFromN(n, score),
        supportingReviewIds: [...new Set(h.ids)].slice(0, 12),
      };
    }
    return out;
  }
}
