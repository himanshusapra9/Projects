/**
 * Filter and refinement system types.
 * Supports hard filters, soft preferences, AI-suggested filters,
 * and dynamic category-specific filter generation.
 */

export interface FilterState {
  hardFilters: HardFilter[];
  softPreferences: SoftPreference[];
  inferredPreferences: InferredPreference[];
  sessionRefinements: SessionRefinement[];
  activeChips: SmartChip[];
}

export interface HardFilter {
  id: string;
  attribute: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'range' | 'exists';
  value: string | number | boolean | string[] | [number, number];
  label: string;
  source: 'user' | 'system';
  removable: boolean;
}

export interface SoftPreference {
  id: string;
  attribute: string;
  direction: 'prefer_high' | 'prefer_low' | 'prefer_value' | 'prefer_match';
  value?: string | number;
  weight: number;
  label: string;
  source: 'user' | 'ai_suggested' | 'memory' | 'behavior';
}

export interface InferredPreference {
  attribute: string;
  value: string;
  confidence: number;
  source: 'query_intent' | 'session_behavior' | 'long_term_memory' | 'category_default';
  explanation: string;
}

export interface SessionRefinement {
  id: string;
  type: 'filter_added' | 'filter_removed' | 'chip_selected' | 'query_refined' | 'clarification_answered';
  timestamp: string;
  detail: Record<string, unknown>;
}

export interface SmartChip {
  id: string;
  label: string;
  type: 'price' | 'trait' | 'quality' | 'risk' | 'category' | 'custom';
  action: ChipAction;
  active: boolean;
  aiSuggested: boolean;
  explanation?: string;
}

export type ChipAction =
  | { kind: 'add_hard_filter'; filter: Omit<HardFilter, 'id'> }
  | { kind: 'add_soft_preference'; preference: Omit<SoftPreference, 'id'> }
  | { kind: 'set_price_cap'; amount: number; currency: string }
  | { kind: 'set_trait'; trait: string; direction: 'prefer' | 'require' }
  | { kind: 'custom_refinement'; query_modifier: string };

export interface FilterConfig {
  category: string;
  availableFilters: FilterDefinition[];
  defaultChips: SmartChip[];
  requiredFilters: string[];
}

export interface FilterDefinition {
  attribute: string;
  label: string;
  type: 'range' | 'select' | 'multi_select' | 'boolean' | 'price_range' | 'rating';
  options?: FilterOption[];
  range?: { min: number; max: number; step: number; unit?: string };
  categorySpecific: boolean;
  priority: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterChangeEvent {
  sessionId: string;
  previousFilters: FilterState;
  newFilters: FilterState;
  changedItems: string[];
  resultDelta: {
    addedProducts: string[];
    removedProducts: string[];
    rankingChanged: boolean;
    newBestPick: boolean;
  };
}

export interface AiSuggestedFilters {
  chips: SmartChip[];
  explanation: string;
  basedOn: ('query_intent' | 'category_norms' | 'user_behavior' | 'memory')[];
}
