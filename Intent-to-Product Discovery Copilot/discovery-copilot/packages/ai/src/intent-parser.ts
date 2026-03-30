import type { ParsedIntent, ConversationTurn, LongTermMemory } from '@discovery-copilot/types';
import { INTENT_EXTRACTION_PROMPT } from './prompts/intent';
import type { LLMProvider } from './llm-provider';

export interface IntentParserConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: IntentParserConfig = {
  model: 'gpt-4o-mini',
  temperature: 0.1,
  maxTokens: 1500,
};

export class IntentParser {
  constructor(
    private llm: LLMProvider,
    private config: IntentParserConfig = DEFAULT_CONFIG,
  ) {}

  async parse(
    query: string,
    history: ConversationTurn[],
    memory?: LongTermMemory,
  ): Promise<ParsedIntent> {
    const prompt = INTENT_EXTRACTION_PROMPT
      .replace('{query}', query)
      .replace('{history}', this.formatHistory(history))
      .replace('{memory}', memory ? this.formatMemory(memory) : 'No prior memory available');

    const response = await this.llm.complete({
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      messages: [{ role: 'user', content: prompt }],
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content) as Omit<ParsedIntent, 'rawQuery'>;

    return this.postProcess({
      ...parsed,
      rawQuery: query,
    });
  }

  private postProcess(intent: ParsedIntent): ParsedIntent {
    if (intent.priceRange) {
      if (intent.priceRange.max && intent.priceRange.max > 0) {
        const hasBudgetConstraint = intent.constraints.some(
          (c) => c.type === 'budget',
        );
        if (!hasBudgetConstraint) {
          intent.constraints.push({
            type: 'budget',
            attribute: 'price',
            operator: 'lte',
            value: intent.priceRange.max,
            isHard: true,
          });
        }
      }
    }

    intent.confidence = Math.max(0, Math.min(1, intent.confidence));

    if (intent.categoryHints.length === 0 && intent.useCases.length === 0) {
      intent.confidence = Math.min(intent.confidence, 0.3);
      intent.ambiguityFactors.push('No category or use case could be determined');
    }

    return intent;
  }

  private formatHistory(turns: ConversationTurn[]): string {
    if (turns.length === 0) return 'No prior conversation';

    return turns
      .slice(-6)
      .map((t) => `[${t.role}] ${t.content}`)
      .join('\n');
  }

  private formatMemory(memory: LongTermMemory): string {
    const parts: string[] = [];

    if (memory.learnedPreferences.length > 0) {
      parts.push(
        'Known preferences: ' +
          memory.learnedPreferences
            .filter((p) => p.confidence >= 0.6)
            .map((p) => `${p.attribute}=${p.value} (confidence: ${p.confidence})`)
            .join(', '),
      );
    }

    if (memory.preferences.preferredBrands.length > 0) {
      parts.push(
        'Preferred brands: ' +
          memory.preferences.preferredBrands.map((b) => b.brand).join(', '),
      );
    }

    if (memory.preferences.dislikedBrands.length > 0) {
      parts.push('Disliked brands: ' + memory.preferences.dislikedBrands.join(', '));
    }

    return parts.join('\n') || 'Minimal prior data';
  }
}
