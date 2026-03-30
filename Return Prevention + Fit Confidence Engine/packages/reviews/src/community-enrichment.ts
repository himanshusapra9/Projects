/**
 * Community feedback enrichment with Reddit-oriented query generation and confidence scoring.
 */

import type { Product, ProductCategory } from "@return-prevention/types";
import { ConfidenceLevel } from "@return-prevention/types";

export interface CommunityThreadStub {
  source: "reddit" | "forum" | "other";
  title: string;
  excerpt: string;
  score: number;
  url?: string;
}

export interface CommunityFeedbackSummary {
  productId: string;
  queryUsed: string;
  threads: CommunityThreadStub[];
  /** [-1, 1] negative = runs small, positive = runs large. */
  fitSkewEstimate: number;
  /** [0, 1] agreement strength. */
  consensusStrength: number;
  contradictions: Array<{ topic: string; summary: string }>;
  confidence: ConfidenceLevel;
}

/**
 * Fetches and summarizes third-party community sentiment (Reddit API skeleton).
 */
export class CommunityEnrichmentService {
  private readonly userAgent: string;

  constructor(opts?: { userAgent?: string }) {
    this.userAgent = opts?.userAgent ?? "ReturnPreventionEngine/0.1 (community enrichment)";
  }

  /**
   * Builds search queries for product discovery on external forums.
   */
  buildSearchQueries(product: Product, category: ProductCategory): string[] {
    const brand = product.attributes.find((a) => a.key === "brand")?.normalizedValue ?? "";
    const tokens = product.title
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 3)
      .slice(0, 4);
    const base = [brand, ...tokens].filter(Boolean).join(" ");
    const queries = [
      `${base} sizing`,
      `${base} fit`,
      `${base} review reddit`,
      `${category} ${tokens[0] ?? "product"} true to size`,
    ];
    return [...new Set(queries)].slice(0, 6);
  }

  /**
   * Placeholder Reddit fetch: swap with OAuth + /search or Pushshift-compatible index.
   */
  async fetchRedditJson(url: string): Promise<unknown> {
    const res = await fetch(url, {
      headers: { "User-Agent": this.userAgent },
    });
    if (!res.ok) throw new Error(`Reddit fetch ${res.status}`);
    return res.json();
  }

  /**
   * @param product - Product context.
   * @param category - Category for priors.
   */
  async fetchCommunityFeedback(product: Product, category: ProductCategory): Promise<CommunityFeedbackSummary> {
    const queries = this.buildSearchQueries(product, category);
    const queryUsed = queries[0] ?? product.title;

    const threads = this.heuristicStubThreads(product, queryUsed);

    const { fitSkew, consensus, contradictions } = this.aggregateThreads(threads);

    const confidence = this.scoreConfidence(threads.length, consensus, contradictions.length);

    return {
      productId: product.productId,
      queryUsed,
      threads,
      fitSkewEstimate: fitSkew,
      consensusStrength: consensus,
      contradictions,
      confidence,
    };
  }

  /** Deterministic stub when network/API unavailable — replace with real search results. */
  private heuristicStubThreads(product: Product, q: string): CommunityThreadStub[] {
    const h = product.productId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const skewHint = (h % 7) - 3;
    return [
      {
        source: "reddit",
        title: `Honest take: ${product.title.slice(0, 40)}`,
        excerpt:
          skewHint < 0
            ? "Runs a bit small vs chart; sized up once and perfect."
            : "Pretty TTS for me; wide foot stay true.",
        score: 42 + (h % 40),
      },
      {
        source: "reddit",
        title: `Question about ${q.slice(0, 32)}`,
        excerpt:
          skewHint === 0
            ? "Mixed: some say narrow toebox others say roomy."
            : "Quality is solid; shipping box crushed corner.",
        score: 18 + (h % 25),
      },
    ];
  }

  private aggregateThreads(threads: CommunityThreadStub[]): {
    fitSkew: number;
    consensus: number;
    contradictions: Array<{ topic: string; summary: string }>;
  } {
    const smallHits = threads.filter((t) => /small|size up|sized up/i.test(t.excerpt)).length;
    const largeHits = threads.filter((t) => /large|size down|sized down/i.test(t.excerpt)).length;
    const mixedHits = threads.filter((t) => /mixed|some say|others say/i.test(t.excerpt)).length;

    const fitSkew = (largeHits - smallHits) / Math.max(1, threads.length);
    const consensus = 1 - mixedHits / Math.max(1, threads.length);

    const contradictions: Array<{ topic: string; summary: string }> = [];
    if (mixedHits > 0) {
      contradictions.push({
        topic: "fit",
        summary: "Community reports conflicting fit experiences.",
      });
    }

    return { fitSkew, consensus, contradictions };
  }

  private scoreConfidence(
    n: number,
    consensus: number,
    contradictionCount: number,
  ): ConfidenceLevel {
    const base = Math.log1p(n) / Math.log1p(8);
    const adj = consensus * (1 - 0.12 * contradictionCount);
    const s = base * adj;
    if (s >= 0.72) return ConfidenceLevel.High;
    if (s >= 0.45) return ConfidenceLevel.Medium;
    if (s >= 0.22) return ConfidenceLevel.Low;
    return ConfidenceLevel.VeryLow;
  }
}
