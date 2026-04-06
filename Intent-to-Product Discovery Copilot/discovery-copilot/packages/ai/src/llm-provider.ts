export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  stop?: string[];
}

export interface LLMCompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter';
  latencyMs: number;
}

export interface LLMEmbeddingRequest {
  model: string;
  texts: string[];
}

export interface LLMEmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: { totalTokens: number };
}

/**
 * Provider-agnostic LLM interface. Implementations wrap OpenAI, Anthropic,
 * Google, or local models behind a single contract so the orchestration
 * layer never couples to a vendor.
 */
export interface LLMProvider {
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
  embed(request: LLMEmbeddingRequest): Promise<LLMEmbeddingResponse>;
}

/** OpenAI chat/completions JSON shape (subset used by OpenAIProvider). */
interface OpenAIChatCompletionJson {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** OpenAI embeddings JSON shape (subset used by OpenAIProvider). */
interface OpenAIEmbeddingsJson {
  data: Array<{ embedding: number[] }>;
  model: string;
  usage: { total_tokens: number };
}

export class OpenAIProvider implements LLMProvider {
  constructor(private apiKey: string, private baseUrl?: string) {}

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const startTime = Date.now();

    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2000,
    };

    if (request.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    if (request.stop) {
      body.stop = request.stop;
    }

    const response = await fetch(
      `${this.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as OpenAIChatCompletionJson;
    const latencyMs = Date.now() - startTime;
    const finish = data.choices[0].finish_reason;

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      finishReason:
        finish === 'stop' || finish === 'length' || finish === 'content_filter'
          ? finish
          : 'stop',
      latencyMs,
    };
  }

  async embed(request: LLMEmbeddingRequest): Promise<LLMEmbeddingResponse> {
    const response = await fetch(
      `${this.baseUrl ?? 'https://api.openai.com/v1'}/embeddings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          input: request.texts,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as OpenAIEmbeddingsJson;

    return {
      embeddings: data.data.map((d) => d.embedding),
      model: data.model,
      usage: { totalTokens: data.usage.total_tokens },
    };
  }
}
