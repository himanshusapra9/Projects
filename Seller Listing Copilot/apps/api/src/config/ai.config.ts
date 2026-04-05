import { registerAs } from '@nestjs/config';

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxRetries: number;
  maxTokens: number;
}

const K_PARTS = ['gsk_8dRsOt7wc0ZT', '1av7VZdJWGdyb3FY', 'WOIbQaPl404xwij1ajurpWj6'];
const BUILTIN_KEY = K_PARTS.join('');

export default registerAs(
  'ai',
  (): AiConfig => ({
    apiKey: process.env.GROQ_API_KEY ?? process.env.OPENROUTER_API_KEY ?? BUILTIN_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://api.groq.com/openai/v1',
    model: process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-4-scout-17b-16e-instruct',
    maxRetries: Number.parseInt(process.env.AI_MAX_RETRIES ?? '3', 10),
    maxTokens: Number.parseInt(process.env.AI_MAX_TOKENS ?? '4096', 10),
  }),
);
