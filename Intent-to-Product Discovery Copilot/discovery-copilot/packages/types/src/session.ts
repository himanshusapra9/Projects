import type { UserPreferences } from './user';

export interface Session {
  id: string;
  userId?: string;
  anonymousId: string;
  turns: ConversationTurn[];
  memory: SessionMemory;
  context: SessionContext;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  lastActivityAt: string;
  expiresAt: string;
}

export interface ConversationTurn {
  id: string;
  sessionId: string;
  turnIndex: number;
  role: 'user' | 'assistant' | 'system';
  type: TurnType;
  content: string;
  parsedIntent?: ParsedIntent;
  clarificationQuestion?: ClarificationQuestion;
  recommendations?: string[];
  feedback?: TurnFeedback;
  metadata: TurnMetadata;
  createdAt: string;
}

export type TurnType =
  | 'initial_query'
  | 'clarification_answer'
  | 'followup_query'
  | 'refinement'
  | 'recommendation_response'
  | 'clarification_request'
  | 'explanation_request'
  | 'comparison_request';

export interface ParsedIntent {
  rawQuery: string;
  primaryNeed: string;
  useCases: string[];
  constraints: IntentConstraint[];
  preferences: IntentPreference[];
  recipient?: RecipientProfile;
  urgency: 'low' | 'medium' | 'high';
  priceRange?: { min?: number; max?: number };
  categoryHints: string[];
  attributeRequirements: Record<string, string | string[]>;
  negativeConstraints: string[];
  confidence: number;
  ambiguityFactors: string[];
}

export interface IntentConstraint {
  type: 'budget' | 'size' | 'color' | 'material' | 'brand' | 'availability' | 'shipping' | 'custom';
  attribute: string;
  operator: 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'in' | 'not_in' | 'contains';
  value: string | number | string[];
  isHard: boolean;
}

export interface IntentPreference {
  attribute: string;
  direction: 'prefer_high' | 'prefer_low' | 'prefer_value';
  value?: string;
  weight: number;
}

export interface RecipientProfile {
  relationship: string;
  ageRange?: string;
  gender?: string;
  interests?: string[];
  personality?: string[];
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multiple_choice' | 'free_text' | 'range' | 'yes_no';
  options?: ClarificationOption[];
  attribute: string;
  priority: number;
  expectedImpact: number;
  reason: string;
}

export interface ClarificationOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface TurnFeedback {
  helpful?: boolean;
  selectedProductId?: string;
  rejectedProductIds?: string[];
  rejectionReasons?: Record<string, string>;
  refinementRequest?: string;
}

export interface TurnMetadata {
  latencyMs: number;
  modelUsed: string;
  tokensUsed: number;
  retrievalCount: number;
  rankingVersion: string;
  experimentIds: string[];
}

export interface SessionMemory {
  activeConstraints: IntentConstraint[];
  activePreferences: IntentPreference[];
  rejectedProducts: RejectedProduct[];
  refinements: string[];
  priceRange?: { min?: number; max?: number };
  confirmedAttributes: Record<string, string>;
  uncertainAttributes: string[];
}

export interface RejectedProduct {
  productId: string;
  reason: string;
  turnIndex: number;
}

export interface SessionContext {
  userAgent: string;
  device: 'desktop' | 'mobile' | 'tablet';
  locale: string;
  currency: string;
  geoRegion?: string;
  referrer?: string;
  entryPoint: string;
}

export interface LongTermMemory {
  userId: string;
  preferences: UserPreferences;
  sessionSummaries: SessionSummary[];
  productInteractions: ProductInteraction[];
  learnedPreferences: LearnedPreference[];
  updatedAt: string;
}

export interface SessionSummary {
  sessionId: string;
  date: string;
  query: string;
  outcome: 'purchased' | 'abandoned' | 'bookmarked' | 'comparison';
  purchasedProductId?: string;
  satisfaction?: number;
  keyPreferences: Record<string, string>;
}

export interface ProductInteraction {
  productId: string;
  type: 'viewed' | 'clicked' | 'added_to_cart' | 'purchased' | 'returned' | 'reviewed';
  timestamp: string;
  context?: string;
}

export interface LearnedPreference {
  attribute: string;
  value: string;
  confidence: number;
  source: 'explicit' | 'inferred_purchase' | 'inferred_browse' | 'inferred_return';
  lastUpdated: string;
}
