/**
 * Provider-agnostic LLM abstraction with OpenAI and Anthropic implementations.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompleteOptions {
  maxTokens?: number;
  temperature?: number;
  stop?: string[];
  timeoutMs?: number;
}

export interface ChatOptions extends CompleteOptions {
  messages: ChatMessage[];
}

export interface LLMProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  maxRetries?: number;
  retryBaseMs?: number;
  defaultTimeoutMs?: number;
}

/**
 * Provider-agnostic interface for chat and completion calls.
 */
export interface LLMProvider {
  readonly name: string;
  chat(options: ChatOptions): Promise<string>;
  complete(prompt: string, options?: CompleteOptions): Promise<string>;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseMs: number,
): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (attempt === maxRetries) break;
      const backoff = baseMs * 2 ** attempt;
      await sleep(Math.min(8000, backoff));
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

/**
 * OpenAI Chat Completions API (v1/chat/completions).
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;
  private readonly defaultTimeoutMs: number;

  constructor(config: LLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? "gpt-4o-mini";
    this.baseUrl = (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.maxRetries = config.maxRetries ?? 3;
    this.retryBaseMs = config.retryBaseMs ?? 400;
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 60_000;
  }

  async chat(options: ChatOptions): Promise<string> {
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    return withRetry(
      async () => {
        const res = await fetchWithTimeout(
          `${this.baseUrl}/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: this.model,
              messages: options.messages,
              max_tokens: options.maxTokens ?? 1024,
              temperature: options.temperature ?? 0.2,
              stop: options.stop,
            }),
          },
          timeoutMs,
        );
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`OpenAI ${res.status}: ${t.slice(0, 500)}`);
        }
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = json.choices?.[0]?.message?.content;
        if (!text) throw new Error("OpenAI: empty completion");
        return text;
      },
      this.maxRetries,
      this.retryBaseMs,
    );
  }

  async complete(prompt: string, options?: CompleteOptions): Promise<string> {
    return this.chat({
      messages: [{ role: "user", content: prompt }],
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      stop: options?.stop,
      timeoutMs: options?.timeoutMs,
    });
  }
}

/**
 * Anthropic Messages API (v1/messages).
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;
  private readonly defaultTimeoutMs: number;

  constructor(config: LLMProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? "claude-3-5-haiku-20241022";
    this.maxRetries = config.maxRetries ?? 3;
    this.retryBaseMs = config.retryBaseMs ?? 400;
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 60_000;
  }

  async chat(options: ChatOptions): Promise<string> {
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const system = options.messages.filter((m) => m.role === "system");
    const rest = options.messages.filter((m) => m.role !== "system");
    const systemText = system.map((m) => m.content).join("\n\n");

    return withRetry(
      async () => {
        const res = await fetchWithTimeout(
          "https://api.anthropic.com/v1/messages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": this.apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: this.model,
              max_tokens: options.maxTokens ?? 1024,
              temperature: options.temperature ?? 0.2,
              system: systemText || undefined,
              messages: rest.map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
              })),
            }),
          },
          timeoutMs,
        );
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Anthropic ${res.status}: ${t.slice(0, 500)}`);
        }
        const json = (await res.json()) as {
          content?: Array<{ type: string; text?: string }>;
        };
        const text = json.content?.map((b) => b.text ?? "").join("") ?? "";
        if (!text) throw new Error("Anthropic: empty completion");
        return text;
      },
      this.maxRetries,
      this.retryBaseMs,
    );
  }

  async complete(prompt: string, options?: CompleteOptions): Promise<string> {
    return this.chat({
      messages: [{ role: "user", content: prompt }],
      maxTokens: options?.maxTokens,
      temperature: options?.temperature,
      timeoutMs: options?.timeoutMs,
    });
  }
}
