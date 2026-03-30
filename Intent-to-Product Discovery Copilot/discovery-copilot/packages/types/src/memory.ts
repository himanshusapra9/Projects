/**
 * Cross-session memory and recall types.
 * Layered: session → user → household → tenant-scoped.
 */

export interface UserMemory {
  userId: string;
  tenantId: string;
  preferences: MemoryPreference[];
  dislikes: MemoryDislike[];
  budgetTendency: BudgetTendency;
  brandAffinities: BrandAffinity[];
  fitSensitivities: FitSensitivity[];
  categoryPatterns: CategoryPattern[];
  priorClarifications: PriorClarification[];
  rejectedRecommendations: RejectedRecommendation[];
  useCasePatterns: UseCasePattern[];
  shoppingContexts: ShoppingContext[];
  lastUpdated: string;
  totalInteractions: number;
  memoryConfidence: number;
}

export interface MemoryPreference {
  attribute: string;
  value: string;
  strength: number;
  confidence: number;
  observedCount: number;
  firstSeen: string;
  lastSeen: string;
  decayedStrength: number;
  source: 'explicit' | 'behavioral' | 'inferred';
}

export interface MemoryDislike {
  attribute: string;
  value: string;
  strength: number;
  reason?: string;
  observedCount: number;
  lastSeen: string;
}

export interface BudgetTendency {
  averageSpend: number;
  medianSpend: number;
  preferredRange: [number, number];
  priceSegment: 'budget' | 'mid_range' | 'premium' | 'luxury' | 'mixed';
  currency: string;
  confidence: number;
}

export interface BrandAffinity {
  brand: string;
  score: number;
  interactionCount: number;
  purchaseCount: number;
  returnCount: number;
  lastInteraction: string;
}

export interface FitSensitivity {
  category: string;
  sizePreference: string;
  fitNotes: string[];
  returnedForFit: boolean;
}

export interface CategoryPattern {
  category: string;
  visitCount: number;
  purchaseCount: number;
  preferredAttributes: Record<string, string>;
  lastVisit: string;
}

export interface PriorClarification {
  questionType: string;
  answer: string;
  category: string;
  timestamp: string;
  stillRelevant: boolean;
}

export interface RejectedRecommendation {
  productId: string;
  rejectionReason: 'too_expensive' | 'wrong_style' | 'wrong_size' | 'wrong_brand' | 'not_relevant' | 'other';
  timestamp: string;
  similarProductPenalty: number;
}

export interface UseCasePattern {
  useCase: string;
  frequency: number;
  lastUsed: string;
  associatedAttributes: Record<string, string>;
}

export interface ShoppingContext {
  type: 'self' | 'gift' | 'household' | 'business';
  recipient?: string;
  occasion?: string;
  timestamp: string;
}

export interface MemoryRetrievalResult {
  relevantPreferences: MemoryPreference[];
  relevantDislikes: MemoryDislike[];
  budgetSignal: BudgetTendency | null;
  brandSignals: BrandAffinity[];
  appliedMemoryItems: AppliedMemoryItem[];
  memoryTransparency: MemoryTransparencyNote[];
}

export interface AppliedMemoryItem {
  type: 'preference' | 'dislike' | 'budget' | 'brand' | 'fit' | 'use_case';
  description: string;
  influence: 'boosted' | 'penalized' | 'filtered' | 'informed';
  confidence: number;
}

export interface MemoryTransparencyNote {
  text: string;
  icon: 'brain' | 'history' | 'heart' | 'alert';
  userCanDismiss: boolean;
}

export interface MemoryEditRequest {
  userId: string;
  action: 'clear_all' | 'clear_category' | 'remove_preference' | 'remove_dislike' | 'pause_memory';
  target?: string;
}
