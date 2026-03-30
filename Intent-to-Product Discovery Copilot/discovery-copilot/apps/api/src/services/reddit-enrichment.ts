import type { Logger } from '@discovery-copilot/shared';
import type {
  CommunityFeedbackDisplay,
  CommunityInsightCard,
  RedditEnrichmentResult,
  RedditInsight,
  RedditQualityFilter,
  RedditQuote,
  RedditSearchQuery,
  RedditSentimentAggregation,
} from '@discovery-copilot/types';

export interface RedditCachePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
}

export interface RedditEnrichmentServiceDeps {
  logger: Logger;
  cache?: RedditCachePort;
  /** Injected fetch for tests or proxies. */
  fetchImpl?: typeof fetch;
  defaultQuality?: Partial<RedditQualityFilter>;
  /** Per-tenant feature flag — when false, enrichment is skipped. */
  isRedditEnabledForTenant?: (tenantId: string) => Promise<boolean> | boolean;
}

const DEFAULT_QUALITY: RedditQualityFilter = {
  minPostScore: 2,
  minCommentScore: 1,
  maxAgeDays: 365,
  excludeSubreddits: [],
  minWordCount: 12,
  excludePatterns: [
    '/s\\b',
    'sarcasm',
    'obviously /s',
    'yeah right',
    'not serious',
    'shitpost',
  ],
  requireVerifiedExperience: false,
};

const THEME_KEYWORDS: { theme: string; re: RegExp }[] = [
  { theme: 'comfort', re: /\b(comfort|comfortable|uncomfortable|ergonomic|padding)\b/i },
  { theme: 'noise', re: /\b(noise|noisy|quiet|silent|db|decibel|loud)\b/i },
  { theme: 'durability', re: /\b(durable|durability|broke|broken|lasted|years|wore out)\b/i },
  { theme: 'sizing', re: /\b(size|sizing|fit|fits|tight|loose|runs small|runs large)\b/i },
  { theme: 'cleaning', re: /\b(clean|cleaning|wash|stain|maintain)\b/i },
  { theme: 'value', re: /\b(price|worth|value|cheap|expensive|overpriced)\b/i },
  { theme: 'quality', re: /\b(quality|well made|cheaply made|build)\b/i },
];

const COMMUNITY_DISCLAIMER =
  'Community feedback from Reddit is opinion-only and may be biased or outdated. It supplements — but does not replace — merchant data and reviews.';

/**
 * Fetches and aggregates Reddit discussions as **community feedback** (never authoritative truth).
 */
export class RedditEnrichmentService {
  private readonly logger: Logger;
  private readonly cache?: RedditCachePort;
  private readonly fetchImpl: typeof fetch;
  private readonly quality: RedditQualityFilter;
  private readonly tenantToggle?: (tenantId: string) => Promise<boolean> | boolean;

  constructor(deps: RedditEnrichmentServiceDeps) {
    this.logger = deps.logger;
    this.cache = deps.cache;
    this.fetchImpl = deps.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.quality = { ...DEFAULT_QUALITY, ...deps.defaultQuality };
    this.tenantToggle = deps.isRedditEnabledForTenant;
  }

  /**
   * Builds search queries for Reddit from product/category context.
   */
  buildSearchQueries(input: {
    productName?: string;
    category: string;
    brand?: string;
    attributes: string[];
    subreddits?: string[];
  }): RedditSearchQuery[] {
    const base = [
      input.productName,
      input.brand ? `${input.brand} ${input.category}` : input.category,
      ...input.attributes.map((a) => `${input.category} ${a}`),
    ].filter(Boolean) as string[];

    return base.map((query) => ({
      query,
      category: input.category,
      productName: input.productName,
      brand: input.brand,
      attributes: input.attributes,
      subreddits: input.subreddits ?? ['BuyItForLife', 'goodvalue', 'frugal'],
      maxAgeDays: this.quality.maxAgeDays,
      minScore: this.quality.minPostScore,
    }));
  }

  /**
   * Runs Reddit JSON search, filters quality, aggregates sentiment by theme, and lowers confidence on contradictions.
   */
  async enrich(params: {
    tenantId: string;
    productId?: string;
    category: string;
    query: string;
    brand?: string;
    attributes?: string[];
  }): Promise<RedditEnrichmentResult> {
    const enabled = await this.resolveTenantEnabled(params.tenantId);
    const lastFetchedAt = new Date().toISOString();

    if (!enabled) {
      return this.disabledResult(params, lastFetchedAt);
    }

    const cacheKey = `reddit:enrich:${params.tenantId}:${params.productId ?? 'q'}:${params.query}:${params.category}`;
    if (this.cache) {
      try {
        const hit = await this.cache.get(cacheKey);
        if (hit) {
          this.logger.debug('reddit.cache hit', { cacheKey });
          return JSON.parse(hit) as RedditEnrichmentResult;
        }
      } catch (err) {
        this.logger.warn('reddit.cache get failed', { error: err instanceof Error ? err.message : err });
      }
    }

    const queries = this.buildSearchQueries({
      productName: params.query,
      category: params.category,
      brand: params.brand,
      attributes: params.attributes ?? [],
    });

    const aggregatedTexts: { text: string; score: number; ageInDays: number; sub: string; title: string; permalink: string }[] =
      [];

    for (const q of queries.slice(0, 3)) {
      const url = this.buildSearchUrl(q.query);
      try {
        const res = await this.fetchImpl(url, {
          headers: {
            'User-Agent': 'DiscoveryCopilot/1.0 (community research; contact: support@example.com)',
            Accept: 'application/json',
          },
        });
        if (!res.ok) {
          this.logger.warn('reddit.search non-OK', { status: res.status, url });
          continue;
        }
        const json = (await res.json()) as RedditListingResponse;
        const children = json?.data?.children ?? [];
        for (const ch of children) {
          if (ch.kind !== 't3' || !ch.data) continue;
          const d = ch.data;
          const title = d.title ?? '';
          const body = d.selftext ?? '';
          const full = `${title}\n${body}`;
          const wc = full.split(/\s+/).filter(Boolean).length;
          if (wc < this.quality.minWordCount) continue;
          const postScore = d.score ?? 0;
          if (postScore < this.quality.minPostScore) continue;
          if (this.quality.excludeSubreddits.map((s: string) => s.toLowerCase()).includes(String(d.subreddit).toLowerCase())) {
            continue;
          }
          const ageInDays = (Date.now() / 1000 - (d.created_utc ?? 0)) / 86400;
          if (ageInDays > this.quality.maxAgeDays) continue;
          if (this.matchesExcludePattern(full)) continue;

          aggregatedTexts.push({
            text: full,
            score: postScore,
            ageInDays,
            sub: d.subreddit ?? 'unknown',
            title,
            permalink: d.permalink ? `https://www.reddit.com${d.permalink}` : '',
          });
        }
      } catch (err) {
        this.logger.error('reddit.fetch failed', { error: err instanceof Error ? err.message : err, url });
      }
    }

    const insights = this.buildInsights(aggregatedTexts);
    const overallSentiment = this.overallSentimentFromInsights(insights);
    const confidence = this.computeResultConfidence(insights, aggregatedTexts.length);
    const freshness = this.freshnessFromAge(aggregatedTexts);

    const result: RedditEnrichmentResult = {
      productId: params.productId,
      category: params.category,
      query: params.query,
      insights,
      overallSentiment,
      confidence,
      postCount: aggregatedTexts.length,
      commentCount: 0,
      freshness,
      lastFetchedAt,
      enabled: true,
    };

    if (this.cache) {
      try {
        await this.cache.set(cacheKey, JSON.stringify(result), 3600);
      } catch (err) {
        this.logger.warn('reddit.cache set failed', { error: err instanceof Error ? err.message : err });
      }
    }

    this.logger.info('reddit.enrichment complete', {
      tenantId: params.tenantId,
      posts: aggregatedTexts.length,
      insightCount: insights.length,
      label: 'community feedback',
    });

    if (params.productId) {
      await this.cacheInsights(params.tenantId, params.productId, result);
    }

    return result;
  }

  /**
   * Returns cached enrichment for a product if present.
   */
  async getCachedInsights(tenantId: string, productId: string): Promise<RedditEnrichmentResult | null> {
    const cacheKey = `reddit:insights:${tenantId}:${productId}`;
    if (!this.cache) return null;
    try {
      const raw = await this.cache.get(cacheKey);
      if (!raw) return null;
      return JSON.parse(raw) as RedditEnrichmentResult;
    } catch (err) {
      this.logger.warn('reddit.getCachedInsights failed', { error: err instanceof Error ? err.message : err });
      return null;
    }
  }

  /**
   * Persists enrichment for GET cache route — call after {@link enrich} when you want per-product cache.
   */
  async cacheInsights(tenantId: string, productId: string, result: RedditEnrichmentResult): Promise<void> {
    if (!this.cache) return;
    const cacheKey = `reddit:insights:${tenantId}:${productId}`;
    try {
      await this.cache.set(cacheKey, JSON.stringify(result), 7200);
    } catch (err) {
      this.logger.warn('reddit.cacheInsights failed', { error: err instanceof Error ? err.message : err });
    }
  }

  /**
   * UI-ready wrapper — labels all copy as community feedback.
   */
  toCommunityFeedbackDisplay(result: RedditEnrichmentResult): CommunityFeedbackDisplay {
    const cards: CommunityInsightCard[] = result.insights.map((i: RedditInsight) => ({
      icon: i.sentiment === 'positive' ? 'thumbs_up' : i.sentiment === 'negative' ? 'thumbs_down' : 'info',
      text: `${i.theme}: ${i.summary}`,
      confidence: result.confidence > 0.65 ? 'high' : result.confidence > 0.35 ? 'moderate' : 'low',
      sentiment: i.sentiment,
      detail: i.representativeQuotes[0]?.text,
    }));

    return {
      headline: 'Community feedback (Reddit)',
      insights: cards,
      disclaimer: COMMUNITY_DISCLAIMER,
      source: 'reddit',
      toggleable: true,
    };
  }

  /**
   * Exposes per-theme aggregation for debugging or admin dashboards.
   */
  aggregateSentimentByTheme(texts: string[]): RedditSentimentAggregation[] {
    return this.themeAggregations(texts);
  }

  private async resolveTenantEnabled(tenantId: string): Promise<boolean> {
    if (!this.tenantToggle) return true;
    const v = await this.tenantToggle(tenantId);
    return Boolean(v);
  }

  private disabledResult(
    params: { category: string; query: string; productId?: string },
    lastFetchedAt: string,
  ): RedditEnrichmentResult {
    return {
      productId: params.productId,
      category: params.category,
      query: params.query,
      insights: [],
      overallSentiment: 'insufficient',
      confidence: 0,
      postCount: 0,
      commentCount: 0,
      freshness: 'stale',
      lastFetchedAt,
      enabled: false,
    };
  }

  private buildSearchUrl(query: string): string {
    const q = encodeURIComponent(query);
    return `https://www.reddit.com/search.json?q=${q}&restrict_sr=0&sort=relevance&t=all&limit=25`;
  }

  private matchesExcludePattern(text: string): boolean {
    return this.quality.excludePatterns.some((p) => {
      try {
        return new RegExp(p, 'i').test(text);
      } catch {
        return text.toLowerCase().includes(p.toLowerCase());
      }
    });
  }

  private themeAggregations(texts: string[]): RedditSentimentAggregation[] {
    const buckets = new Map<
      string,
      { pos: number; neg: number; neu: number; contradiction: number }
    >();

    for (const t of THEME_KEYWORDS) {
      buckets.set(t.theme, { pos: 0, neg: 0, neu: 0, contradiction: 0 });
    }

    for (const text of texts) {
      const positive = /\b(love|great|amazing|recommend|best|excellent|perfect)\b/i.test(text);
      const negative = /\b(terrible|awful|worst|avoid|junk|returned|broke|hate)\b/i.test(text);

      for (const { theme, re } of THEME_KEYWORDS) {
        if (!re.test(text)) continue;
        const b = buckets.get(theme)!;
        if (positive && !negative) b.pos += 1;
        else if (negative && !positive) b.neg += 1;
        else if (positive && negative) {
          b.neu += 1;
          b.contradiction += 1;
        } else {
          b.neu += 1;
        }
      }
    }

    return THEME_KEYWORDS.map(({ theme }) => {
      const b = buckets.get(theme)!;
      const total = b.pos + b.neg + b.neu + 1e-6;
      const net = (b.pos - b.neg) / total;
      const contradictionLevel: RedditSentimentAggregation['contradictionLevel'] =
        b.contradiction >= 3 ? 'high' : b.contradiction >= 1 ? 'some' : 'none';
      const confidence = Math.min(1, total / 8) * (contradictionLevel === 'high' ? 0.55 : contradictionLevel === 'some' ? 0.75 : 1);

      return {
        theme,
        positiveCount: b.pos,
        negativeCount: b.neg,
        neutralCount: b.neu,
        netSentiment: net,
        confidence,
        contradictionLevel,
      };
    });
  }

  private buildInsights(
    posts: { text: string; score: number; ageInDays: number; sub: string; title: string; permalink: string }[],
  ): RedditInsight[] {
    const texts = posts.map((p) => p.text);
    const aggs = this.themeAggregations(texts);

    const insights: RedditInsight[] = [];
    let id = 0;

    for (const agg of aggs) {
      if (agg.positiveCount + agg.negativeCount + agg.neutralCount < 2) continue;

      const sentiment: RedditInsight['sentiment'] =
        agg.netSentiment > 0.15 ? 'positive' : agg.netSentiment < -0.15 ? 'negative' : 'neutral';

      const matchingPosts = posts.filter((p: (typeof posts)[number]) =>
        THEME_KEYWORDS.find((tk) => tk.theme === agg.theme)?.re.test(p.text),
      );
      const quotes: RedditQuote[] = matchingPosts.slice(0, 2).map((p) => ({
        text: p.text.slice(0, 400),
        subreddit: p.sub,
        postTitle: p.title,
        score: p.score,
        commentScore: 0,
        ageInDays: p.ageInDays,
        url: p.permalink,
        quality: p.score >= 10 ? 'high' : p.score >= 4 ? 'medium' : 'low',
      }));

      const contradictions: string[] = [];
      if (agg.contradictionLevel !== 'none') {
        contradictions.push(
          `Mixed signals on ${agg.theme} in community feedback — confidence reduced.`,
        );
      }

      const conf = agg.confidence * (agg.contradictionLevel === 'high' ? 0.6 : 1);

      insights.push({
        id: `reddit-insight-${id++}`,
        theme: agg.theme,
        sentiment,
        frequency: agg.positiveCount + agg.negativeCount + agg.neutralCount,
        confidence: conf,
        summary: `Community feedback often mentions ${agg.theme} (${sentiment}).`,
        representativeQuotes: quotes,
        contradictions,
        applicableToProducts: [],
      });
    }

    return insights;
  }

  private overallSentimentFromInsights(insights: RedditInsight[]): RedditEnrichmentResult['overallSentiment'] {
    if (insights.length === 0) return 'insufficient';
    const scores: number[] = insights.map((i: RedditInsight) =>
      i.sentiment === 'positive' ? 1 : i.sentiment === 'negative' ? -1 : 0,
    );
    const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    if (Math.abs(avg) < 0.2) return 'mixed';
    return avg > 0 ? 'positive' : 'negative';
  }

  private computeResultConfidence(insights: RedditInsight[], postCount: number): number {
    if (postCount === 0) return 0;
    const base = Math.min(1, postCount / 15);
    const insightFactor = insights.length ? insights.reduce((a, i) => a + i.confidence, 0) / insights.length : 0;
    const contradictionPenalty = insights.some((i) => i.contradictions.length > 0) ? 0.85 : 1;
    return Math.min(1, base * 0.5 + insightFactor * 0.5) * contradictionPenalty;
  }

  private freshnessFromAge(posts: { ageInDays: number }[]): RedditEnrichmentResult['freshness'] {
    if (posts.length === 0) return 'stale';
    const youngest = Math.min(...posts.map((p) => p.ageInDays));
    if (youngest < 45) return 'recent';
    if (youngest < 180) return 'moderate';
    return 'stale';
  }
}

interface RedditListingResponse {
  data?: {
    children?: Array<{
      kind: string;
      data?: {
        title?: string;
        selftext?: string;
        score?: number;
        created_utc?: number;
        subreddit?: string;
        permalink?: string;
      };
    }>;
  };
}
