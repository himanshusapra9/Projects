export interface ConfidenceSignals {
  modelConfidence: number;
  sourceQuality: number;
  crossSourceAgreement: number;
  schemaCompatibility: number;
  sellerHistoryMatch: number;
}

export interface ScoredAttribute {
  fieldName: string;
  value: string;
  confidence: number;
  requiresReview: boolean;
  signals: ConfidenceSignals;
}
