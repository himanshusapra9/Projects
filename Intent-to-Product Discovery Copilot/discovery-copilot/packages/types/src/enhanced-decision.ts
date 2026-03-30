import type { RecommendationCard, DecisionMetadata } from './decision';
import type { ConfidenceScore } from './recommendation';
import type { ParsedIntent, ClarificationQuestion } from './session';
import type { SmartChip, AiSuggestedFilters, FilterState } from './filters';
import type { AppliedMemoryItem, MemoryTransparencyNote } from './memory';
import type { CommunityFeedbackDisplay } from './reddit';
import type { RelationalContext, ComparisonTable } from './relational';
import type { ExtractedSignal } from './behavior';

/**
 * The enhanced decision response — the full output of the decision engine
 * including filters, behavior signals, memory, community feedback, and relational reasoning.
 */
export interface EnhancedDecisionResponse {
  id: string;
  sessionId: string;
  query: string;

  decision: EnhancedDecision;
  confidence: ConfidenceScore;
  parsedIntent: ParsedIntent;

  smartFilters: AiSuggestedFilters;
  activeFilters: FilterState;
  suggestedRefinements: SuggestedRefinement[];
  relatedSearches: string[];

  memoryApplied: AppliedMemoryItem[];
  memoryTransparency: MemoryTransparencyNote[];
  behaviorSignalsUsed: ExtractedSignal[];

  communityFeedback?: CommunityFeedbackDisplay;
  relationalContext?: RelationalContext;
  comparison?: ComparisonTable;

  clarification?: ClarificationQuestion[];
  metadata: DecisionMetadata;
}

export interface EnhancedDecision {
  bestPick: RecommendationCard;
  bestValue: RecommendationCard | null;
  lowRiskPick: RecommendationCard | null;
  premiumPick: RecommendationCard | null;
  alternatives: RecommendationCard[];

  rationale: string;
  tradeoffSummary: string;
  missingInformation: string[];
  whatWouldChange: WhatWouldChange[];
  filterInfluence: FilterInfluence[];
  memoryInfluence: string[];
  communityInfluence?: string;
}

export interface SuggestedRefinement {
  label: string;
  type: 'chip' | 'filter' | 'query' | 'clarification';
  action: string;
  explanation: string;
  expectedImpact: 'high' | 'medium' | 'low';
}

export interface WhatWouldChange {
  condition: string;
  newBestPick?: string;
  rankingShift: string;
}

export interface FilterInfluence {
  filterId: string;
  label: string;
  impact: 'excluded_products' | 'reranked' | 'boosted_preference';
  affectedCount: number;
}
