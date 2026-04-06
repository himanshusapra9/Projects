import type { ParsedIntent, ClarificationQuestion, Product } from '@discovery-copilot/types';
import { CLARIFICATION_PLANNING_PROMPT } from './prompts/clarification';
import type { LLMProvider } from './llm-provider';

export interface ClarificationDecision {
  shouldAsk: boolean;
  score: number;
  strategy: 'show_results' | 'show_with_refinement' | 'ask_then_show';
  questions: ClarificationQuestion[];
  factorScores: ClarificationFactors;
}

export interface ClarificationFactors {
  ambiguity: number;
  catalogBreadth: number;
  attributeSensitivity: number;
  consequenceOfMismatch: number;
  budgetUncertainty: number;
  confidenceSpread: number;
}

const FACTOR_WEIGHTS: Record<keyof ClarificationFactors, number> = {
  ambiguity: 0.25,
  catalogBreadth: 0.15,
  attributeSensitivity: 0.20,
  consequenceOfMismatch: 0.20,
  budgetUncertainty: 0.10,
  confidenceSpread: 0.10,
};

export class ClarificationPlanner {
  constructor(private llm: LLMProvider) {}

  async plan(
    intent: ParsedIntent,
    candidates: Product[],
    turnCount: number,
  ): Promise<ClarificationDecision> {
    const factors = this.computeFactors(intent, candidates);
    const score = this.computeScore(factors);

    if (turnCount >= 2 && score < 0.7) {
      return {
        shouldAsk: false,
        score,
        strategy: 'show_results',
        questions: [],
        factorScores: factors,
      };
    }

    const strategy = this.determineStrategy(score, turnCount);

    if (strategy === 'show_results') {
      return { shouldAsk: false, score, strategy, questions: [], factorScores: factors };
    }

    const questions = await this.generateQuestions(intent, candidates, strategy);

    return {
      shouldAsk: questions.length > 0,
      score,
      strategy,
      questions,
      factorScores: factors,
    };
  }

  private computeFactors(
    intent: ParsedIntent,
    candidates: Product[],
  ): ClarificationFactors {
    const uniqueCategories = new Set(
      candidates.map((c) => c.category.l2),
    ).size;
    const categorySpread = Math.min(uniqueCategories / 5, 1);

    const hasBudget = intent.priceRange?.max != null;
    const hasSizeNeeds = intent.attributeRequirements['size'] != null;

    const priceRange = candidates.length > 0
      ? Math.max(...candidates.map((c) => c.price.amount)) -
        Math.min(...candidates.map((c) => c.price.amount))
      : 0;

    return {
      ambiguity: 1 - intent.confidence,
      catalogBreadth: categorySpread,
      attributeSensitivity: this.computeAttributeSensitivity(intent),
      consequenceOfMismatch: this.computeConsequence(intent),
      budgetUncertainty: hasBudget ? 0.1 : 0.7,
      confidenceSpread: Math.min(priceRange / 200, 1),
    };
  }

  private computeAttributeSensitivity(intent: ParsedIntent): number {
    const sensitiveAttributes = [
      'size', 'fit', 'skin_type', 'dietary', 'allergy',
      'compatibility', 'voltage', 'dimensions',
    ];
    const mentionedSensitive = intent.ambiguityFactors.filter((f) =>
      sensitiveAttributes.some((a) => f.toLowerCase().includes(a)),
    );
    return Math.min(mentionedSensitive.length / 3, 1);
  }

  private computeConsequence(intent: ParsedIntent): number {
    const highConsequenceCategories = [
      'furniture', 'electronics', 'appliances', 'mattress',
      'jewelry', 'luggage',
    ];
    const isHighConsequence = intent.categoryHints.some((h) =>
      highConsequenceCategories.some((c) => h.toLowerCase().includes(c)),
    );
    const isGift = intent.recipient != null;

    let score = 0.3;
    if (isHighConsequence) score += 0.4;
    if (isGift) score += 0.2;
    if (intent.priceRange?.max && intent.priceRange.max > 200) score += 0.1;
    return Math.min(score, 1);
  }

  private computeScore(factors: ClarificationFactors): number {
    let score = 0;
    for (const [key, weight] of Object.entries(FACTOR_WEIGHTS)) {
      score += factors[key as keyof ClarificationFactors] * weight;
    }
    return Math.round(score * 100) / 100;
  }

  private determineStrategy(
    score: number,
    turnCount: number,
  ): ClarificationDecision['strategy'] {
    if (score < 0.3) return 'show_results';
    if (score < 0.5 || turnCount >= 1) return 'show_with_refinement';
    return 'ask_then_show';
  }

  private async generateQuestions(
    intent: ParsedIntent,
    candidates: Product[],
    strategy: ClarificationDecision['strategy'],
  ): Promise<ClarificationQuestion[]> {
    const maxQuestions = strategy === 'show_with_refinement' ? 1 : 3;

    const prompt = CLARIFICATION_PLANNING_PROMPT
      .replace('{intent}', JSON.stringify(intent))
      .replace('{catalogCoverage}', `${candidates.length} candidates found`)
      .replace('{ambiguityFactors}', JSON.stringify(intent.ambiguityFactors))
      .replace('{confidence}', String(intent.confidence))
      .replace('{candidateSpread}', String(candidates.length))
      .replace('{turnCount}', '0')
      .replace('{patienceSignal}', 'neutral');

    const response = await this.llm.complete({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      responseFormat: 'json',
    });

    const parsed = JSON.parse(response.content);
    return (parsed.questions ?? []).slice(0, maxQuestions);
  }
}
