import type { Product, ReviewTheme } from './product';

export interface RecommendationSet {
  id: string;
  sessionId: string;
  turnIndex: number;
  query: string;
  candidates: RankedCandidate[];
  explanation: SetExplanation;
  confidence: ConfidenceScore;
  diversityScore: number;
  generatedAt: string;
}

export interface RankedCandidate {
  product: Product;
  rank: number;
  score: CompositeScore;
  explanation: ProductExplanation;
  badges: RecommendationBadge[];
  tradeoffs: Tradeoff[];
  confidence: number;
  matchedAttributes: MatchedAttribute[];
}

export interface CompositeScore {
  final: number;
  components: ScoreComponent[];
  normalizedComponents: Record<string, number>;
}

export interface ScoreComponent {
  name: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  source: 'lexical' | 'semantic' | 'taxonomy' | 'review' | 'return' | 'price' | 'popularity' | 'business' | 'memory';
}

export interface ProductExplanation {
  headline: string;
  reasons: ExplanationReason[];
  caveats: string[];
  reviewHighlights: ReviewHighlight[];
  comparisonNotes?: string;
}

export interface ExplanationReason {
  text: string;
  attribute: string;
  evidence: 'catalog' | 'reviews' | 'returns' | 'specs' | 'popularity';
  strength: 'strong' | 'moderate' | 'weak';
}

export interface ReviewHighlight {
  snippet: string;
  rating: number;
  theme: string;
  relevance: number;
}

export type BadgeType =
  | 'best_match'
  | 'best_value'
  | 'low_return_risk'
  | 'top_rated'
  | 'great_for_use_case'
  | 'editor_pick'
  | 'budget_friendly'
  | 'premium_choice'
  | 'most_popular'
  | 'new_arrival';

export interface RecommendationBadge {
  type: BadgeType;
  label: string;
  tooltip: string;
}

export interface Tradeoff {
  attribute: string;
  description: string;
  severity: 'minor' | 'notable' | 'significant';
}

export interface MatchedAttribute {
  queryAttribute: string;
  productAttribute: string;
  matchType: 'exact' | 'semantic' | 'inferred' | 'review_derived';
  confidence: number;
}

export interface ConfidenceScore {
  overall: number;
  catalogCoverage: number;
  intentClarity: number;
  attributeMatchRate: number;
  reviewSupport: number;
  uncertaintyFactors: string[];
  recommendation: 'high_confidence' | 'moderate_needs_refinement' | 'low_ask_clarification';
}

export interface SetExplanation {
  summary: string;
  strategy: string;
  coverageNote?: string;
  diversityNote?: string;
}

export interface ExplanationPayload {
  recommendationId: string;
  productId: string;
  headline: string;
  bullets: string[];
  reviewEvidence: ReviewHighlight[];
  tradeoffs: Tradeoff[];
  confidence: number;
  returnRiskNote?: string;
}
