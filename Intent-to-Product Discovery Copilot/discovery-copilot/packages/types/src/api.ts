import type { ConversationTurn, ClarificationQuestion, ParsedIntent, SessionContext } from './session';
import type { RankedCandidate, ConfidenceScore, SetExplanation } from './recommendation';
import type { FeedbackEventType } from './evaluation';
import type { LongTermMemory } from './session';

// --- Session APIs ---

export interface StartSessionRequest {
  anonymousId?: string;
  userId?: string;
  context: SessionContext;
}

export interface StartSessionResponse {
  sessionId: string;
  welcomeMessage: string;
  memorySummary?: string;
  suggestedQueries?: string[];
}

// --- Query APIs ---

export interface SubmitQueryRequest {
  sessionId: string;
  query: string;
  turnType: 'initial_query' | 'followup_query' | 'refinement';
}

export interface SubmitQueryResponse {
  turnId: string;
  type: 'recommendations' | 'clarification' | 'mixed';
  recommendations?: RecommendationResponse;
  clarificationQuestions?: ClarificationQuestion[];
  message: string;
  confidence: ConfidenceScore;
  parsedIntent: ParsedIntent;
  metadata: ResponseMetadata;
}

export interface RecommendationResponse {
  setId: string;
  candidates: RankedCandidate[];
  explanation: SetExplanation;
  refinementSuggestions: string[];
  hasMore: boolean;
}

// --- Clarification APIs ---

export interface AnswerClarificationRequest {
  sessionId: string;
  questionId: string;
  answer: string | string[];
}

export interface AnswerClarificationResponse {
  turnId: string;
  recommendations: RecommendationResponse;
  followUpQuestion?: ClarificationQuestion;
  message: string;
  confidence: ConfidenceScore;
  metadata: ResponseMetadata;
}

// --- Feedback APIs ---

export interface SubmitFeedbackRequest {
  sessionId: string;
  type: FeedbackEventType;
  productId?: string;
  recommendationSetId?: string;
  turnIndex: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface SubmitFeedbackResponse {
  eventId: string;
  acknowledged: boolean;
}

// --- Memory APIs ---

export interface GetMemoryRequest {
  userId: string;
}

export interface GetMemoryResponse {
  memory: LongTermMemory;
  summary: string;
}

export interface UpdateMemoryRequest {
  userId: string;
  preferences?: Partial<LongTermMemory['preferences']>;
  clearHistory?: boolean;
}

export interface UpdateMemoryResponse {
  success: boolean;
  updatedAt: string;
}

// --- Tracking APIs ---

export interface TrackEventRequest {
  sessionId: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  type: FeedbackEventType;
  productId?: string;
  recommendationSetId?: string;
  position?: number;
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
}

export interface TrackEventResponse {
  received: number;
  acknowledged: boolean;
}

// --- Admin APIs ---

export interface EvaluationRunRequest {
  datasetId: string;
  modelVersion?: string;
  rankingVersion?: string;
  sampleSize?: number;
}

export interface EvaluationRunResponse {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  estimatedDurationMs?: number;
}

// --- Common ---

export interface ResponseMetadata {
  latencyMs: number;
  modelUsed: string;
  tokensUsed: number;
  retrievalCount: number;
  experimentVariant?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
}
