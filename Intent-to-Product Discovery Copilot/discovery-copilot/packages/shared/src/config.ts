export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  port: number;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  llm: {
    provider: 'openai' | 'anthropic' | 'google';
    apiKey: string;
    defaultModel: string;
    embeddingModel: string;
    maxRetries: number;
    timeoutMs: number;
  };
  search: {
    provider: 'elasticsearch' | 'opensearch' | 'algolia';
    host: string;
    apiKey?: string;
    indexPrefix: string;
  };
  features: {
    enableMemory: boolean;
    enableReturnRisk: boolean;
    enableReviewIntelligence: boolean;
    maxClarificationQuestions: number;
    maxRecommendations: number;
    sessionTtlMinutes: number;
  };
  observability: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    tracingEnabled: boolean;
    metricsEnabled: boolean;
  };
}

export function loadConfig(): AppConfig {
  return {
    env: (process.env.NODE_ENV as AppConfig['env']) ?? 'development',
    port: parseInt(process.env.PORT ?? '3001', 10),
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      name: process.env.DB_NAME ?? 'discovery_copilot',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      ssl: process.env.DB_SSL === 'true',
    },
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    llm: {
      provider: (process.env.LLM_PROVIDER as AppConfig['llm']['provider']) ?? 'openai',
      apiKey: process.env.LLM_API_KEY ?? '',
      defaultModel: process.env.LLM_DEFAULT_MODEL ?? 'gpt-4o-mini',
      embeddingModel: process.env.LLM_EMBEDDING_MODEL ?? 'text-embedding-3-small',
      maxRetries: parseInt(process.env.LLM_MAX_RETRIES ?? '3', 10),
      timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS ?? '30000', 10),
    },
    search: {
      provider: (process.env.SEARCH_PROVIDER as AppConfig['search']['provider']) ?? 'elasticsearch',
      host: process.env.SEARCH_HOST ?? 'http://localhost:9200',
      apiKey: process.env.SEARCH_API_KEY,
      indexPrefix: process.env.SEARCH_INDEX_PREFIX ?? 'copilot',
    },
    features: {
      enableMemory: process.env.FEATURE_MEMORY !== 'false',
      enableReturnRisk: process.env.FEATURE_RETURN_RISK !== 'false',
      enableReviewIntelligence: process.env.FEATURE_REVIEW_INTEL !== 'false',
      maxClarificationQuestions: parseInt(process.env.MAX_CLARIFICATION_QUESTIONS ?? '3', 10),
      maxRecommendations: parseInt(process.env.MAX_RECOMMENDATIONS ?? '5', 10),
      sessionTtlMinutes: parseInt(process.env.SESSION_TTL_MINUTES ?? '30', 10),
    },
    observability: {
      logLevel: (process.env.LOG_LEVEL as AppConfig['observability']['logLevel']) ?? 'info',
      tracingEnabled: process.env.TRACING_ENABLED === 'true',
      metricsEnabled: process.env.METRICS_ENABLED === 'true',
    },
  };
}
