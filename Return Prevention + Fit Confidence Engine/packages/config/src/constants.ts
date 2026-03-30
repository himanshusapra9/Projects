import type { SupportedCategory } from './categories';

export const API_RATE_LIMITS = {
  scoringPerMinute: 120,
  batchPerMinute: 20,
  adminPerMinute: 60,
  windowSeconds: 60,
} as const;

export const CACHE_TTL = {
  productCatalog: 900,
  reviewSignals: 3600,
  sessionHints: 300,
  tenantConfig: 600,
  notFoundShort: 60,
} as const;

export const MEMORY_DECAY = {
  brandAffinityPerDay: 0.985,
  sizeTokenAffinityPerDay: 0.992,
  negativeSignalPerDay: 0.97,
} as const;

export const LIMITS = {
  maxClarificationQuestions: 3,
  maxAlternatives: 6,
  maxEvidenceRefs: 12,
  maxNeighborSizes: 8,
} as const;

export const SUPPORTED_CATEGORIES: readonly SupportedCategory[] = [
  'apparel',
  'footwear',
  'furniture',
  'beauty',
  'travel_gear',
  'home_goods',
  'accessories',
  'electronics',
] as const;

export const SUPPORTED_LOCALES = ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-ES', 'ja-JP'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
