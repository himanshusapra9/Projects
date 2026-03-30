/**
 * Reddit community feedback enrichment types.
 * Supplemental signal only — never source of truth.
 */

export interface RedditEnrichmentResult {
  productId?: string;
  category: string;
  query: string;
  insights: RedditInsight[];
  overallSentiment: 'positive' | 'mixed' | 'negative' | 'insufficient';
  confidence: number;
  postCount: number;
  commentCount: number;
  freshness: 'recent' | 'moderate' | 'stale';
  lastFetchedAt: string;
  enabled: boolean;
}

export interface RedditInsight {
  id: string;
  theme: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  frequency: number;
  confidence: number;
  summary: string;
  representativeQuotes: RedditQuote[];
  contradictions: string[];
  applicableToProducts: string[];
}

export interface RedditQuote {
  text: string;
  subreddit: string;
  postTitle: string;
  score: number;
  commentScore: number;
  ageInDays: number;
  url: string;
  quality: 'high' | 'medium' | 'low';
}

export interface RedditSearchQuery {
  query: string;
  category: string;
  productName?: string;
  brand?: string;
  attributes: string[];
  subreddits: string[];
  maxAgeDays: number;
  minScore: number;
}

export interface RedditQualityFilter {
  minPostScore: number;
  minCommentScore: number;
  maxAgeDays: number;
  excludeSubreddits: string[];
  minWordCount: number;
  excludePatterns: string[];
  requireVerifiedExperience: boolean;
}

export interface RedditSentimentAggregation {
  theme: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  netSentiment: number;
  confidence: number;
  contradictionLevel: 'none' | 'some' | 'high';
}

export interface CommunityFeedbackDisplay {
  headline: string;
  insights: CommunityInsightCard[];
  disclaimer: string;
  source: 'reddit' | 'community';
  toggleable: boolean;
}

export interface CommunityInsightCard {
  icon: 'thumbs_up' | 'thumbs_down' | 'alert' | 'info' | 'star';
  text: string;
  confidence: 'high' | 'moderate' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  detail?: string;
}
