export interface MerchantTenant {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'growth' | 'enterprise';
  mode: 'api' | 'hosted' | 'both';
  catalogConfig: CatalogConfig;
  searchConfig: SearchConfig;
  brandingConfig: BrandingConfig;
  integrationTier: 'basic' | 'intermediate' | 'advanced';
  apiKeys: ApiKeyRecord[];
  webhooks: WebhookConfig[];
  status: 'onboarding' | 'active' | 'paused' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CatalogConfig {
  feedUrl?: string;
  feedFormat: 'json' | 'csv' | 'xml' | 'shopify' | 'bigcommerce' | 'magento';
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  lastSyncAt?: string;
  productCount: number;
  categoryCount: number;
  healthScore: number;
  hasReviews: boolean;
  hasReturnsData: boolean;
  hasInventoryData: boolean;
}

export interface SearchConfig {
  maxClarificationQuestions: number;
  maxRecommendations: number;
  rankingWeightOverrides?: Partial<Record<string, number>>;
  enableMemory: boolean;
  enableReturnRisk: boolean;
  enableReviewIntelligence: boolean;
  defaultCurrency: string;
  defaultLocale: string;
  blockedCategories: string[];
  boostedCategories: string[];
  customPromptAdditions?: string;
}

export interface BrandingConfig {
  primaryColor: string;
  logoUrl?: string;
  fontFamily?: string;
  borderRadius: 'sharp' | 'rounded' | 'pill';
  theme: 'light' | 'dark' | 'auto';
  customCss?: string;
}

export interface ApiKeyRecord {
  id: string;
  prefix: string;
  hashedKey: string;
  label: string;
  permissions: ('read' | 'write' | 'admin')[];
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
}

export type WebhookEvent =
  | 'catalog.sync.completed'
  | 'catalog.sync.failed'
  | 'recommendation.generated'
  | 'feedback.received'
  | 'evaluation.completed';
