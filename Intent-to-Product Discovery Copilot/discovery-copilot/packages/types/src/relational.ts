/**
 * Relational reasoning types.
 * Enables the system to relate products, preferences, and needs intelligently.
 */

export type RelationshipType =
  | 'similar_style'
  | 'better_tradeoff'
  | 'more_durable'
  | 'cheaper_alternative'
  | 'premium_upgrade'
  | 'lower_return_risk'
  | 'same_usecase_different_aesthetic'
  | 'substitute'
  | 'complement'
  | 'bundle'
  | 'related_need'
  | 'lighter_alternative'
  | 'quieter_alternative'
  | 'easier_to_clean';

export interface ProductRelationship {
  sourceProductId: string;
  targetProductId: string;
  type: RelationshipType;
  strength: number;
  explanation: string;
  tradeoff: TradeoffExplanation;
  confidence: number;
}

export interface TradeoffExplanation {
  gains: string[];
  losses: string[];
  netAssessment: 'upgrade' | 'sidegrade' | 'downgrade' | 'different';
  summary: string;
}

export interface RelationalContext {
  currentProduct: string;
  relatedProducts: ProductRelationship[];
  substitutes: SubstituteReasoning[];
  complements: ComplementReasoning[];
  upgradePath: UpgradePath | null;
  userHistoryRelations: UserHistoryRelation[];
}

export interface SubstituteReasoning {
  productId: string;
  reason: string;
  differentiator: string;
  whenToPick: string;
}

export interface ComplementReasoning {
  productId: string;
  reason: string;
  bundleDiscount?: number;
  useTogether: string;
}

export interface UpgradePath {
  fromProductId: string;
  toProductId: string;
  priceDelta: number;
  valueProposition: string;
  keyImprovements: string[];
}

export interface UserHistoryRelation {
  type: 'similar_to_past_purchase' | 'similar_to_past_view' | 'addresses_past_return_reason' | 'matches_stated_preference';
  description: string;
  confidence: number;
  referenceProductId?: string;
  referenceEvent?: string;
}

export interface ComparisonTable {
  products: ComparisonProduct[];
  attributes: ComparisonAttribute[];
  recommendation: string;
}

export interface ComparisonProduct {
  productId: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  overallScore: number;
}

export interface ComparisonAttribute {
  name: string;
  label: string;
  values: ComparisonValue[];
  winner?: string;
  importance: 'critical' | 'important' | 'nice_to_have';
}

export interface ComparisonValue {
  productId: string;
  value: string;
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'n/a';
}
