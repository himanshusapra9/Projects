import type {
  Session,
  ConversationTurn,
  ParsedIntent,
  ClarificationQuestion,
  LongTermMemory,
  SubmitQueryResponse,
  RecommendationResponse,
  ConfidenceScore,
  RankedCandidate,
  Product,
  ResponseMetadata,
} from '@discovery-copilot/types';
import { IntentParser } from './intent-parser';
import { ClarificationPlanner, type ClarificationDecision } from './clarification-planner';
import { runGuardrails } from './guardrails';
import { SYSTEM_PROMPT } from './prompts/system';
import { EXPLANATION_GENERATION_PROMPT } from './prompts/explanation';
import { FOLLOWUP_HANDLING_PROMPT } from './prompts/followup';
import type { LLMProvider } from './llm-provider';

export interface OrchestratorDeps {
  llm: LLMProvider;
  retrievalService: RetrievalService;
  rankingService: RankingService;
  memoryService: MemoryService;
  reviewService: ReviewService;
}

export interface RetrievalService {
  retrieve(intent: ParsedIntent, limit: number): Promise<Product[]>;
}

export interface RankingService {
  rank(
    products: Product[],
    intent: ParsedIntent,
    memory?: LongTermMemory,
  ): Promise<RankedCandidate[]>;
}

export interface MemoryService {
  getLongTermMemory(userId: string): Promise<LongTermMemory | null>;
  updateFromSession(session: Session): Promise<void>;
}

export interface ReviewService {
  getRelevantSnippets(
    productIds: string[],
    attributes: string[],
  ): Promise<Map<string, string[]>>;
}

/**
 * The core agentic loop. Each user turn flows through:
 *   Intent → Clarification check → Retrieve → Rank → Explain → Guardrails → Respond
 *
 * The orchestrator owns the decision of which stages to run on each turn,
 * including short-circuits when a clarification is needed first.
 */
export class ShoppingCopilotOrchestrator {
  private intentParser: IntentParser;
  private clarificationPlanner: ClarificationPlanner;

  constructor(private deps: OrchestratorDeps) {
    this.intentParser = new IntentParser(deps.llm);
    this.clarificationPlanner = new ClarificationPlanner(deps.llm);
  }

  async handleQuery(
    session: Session,
    query: string,
    turnType: 'initial_query' | 'followup_query' | 'refinement',
  ): Promise<SubmitQueryResponse> {
    const startTime = Date.now();
    let tokensUsed = 0;

    // Stage 1: Resolve user memory if available
    const memory = session.userId
      ? await this.deps.memoryService.getLongTermMemory(session.userId)
      : null;

    // Stage 2: Parse intent (handles follow-ups by merging with history)
    const intent = await this.intentParser.parse(
      query,
      session.turns,
      memory ?? undefined,
    );
    tokensUsed += 500; // approximate

    // Stage 3: Initial retrieval for clarification assessment
    const initialCandidates = await this.deps.retrievalService.retrieve(intent, 50);

    // Stage 4: Decide on clarification
    const clarificationDecision = await this.clarificationPlanner.plan(
      intent,
      initialCandidates,
      session.turns.filter((t) => t.role === 'user').length,
    );

    // Stage 5: Branch based on clarification decision
    if (clarificationDecision.strategy === 'ask_then_show') {
      return this.buildClarificationResponse(
        intent,
        clarificationDecision,
        startTime,
        tokensUsed,
      );
    }

    // Stage 6: Full ranking pipeline
    const ranked = await this.deps.rankingService.rank(
      initialCandidates,
      intent,
      memory ?? undefined,
    );

    // Stage 7: Generate explanations for top candidates
    const topCandidates = ranked.slice(0, 5);
    const explained = await this.generateExplanations(topCandidates, intent);
    tokensUsed += 800;

    // Stage 8: Run guardrails
    const guardrailResult = runGuardrails(
      explained,
      explained.map((c) => c.explanation.headline),
      { locale: session.context.locale },
    );

    // Stage 9: Compute confidence
    const confidence = this.computeConfidence(intent, guardrailResult.filtered);

    // Stage 10: Build response
    const recommendations: RecommendationResponse = {
      setId: `rec_${Date.now()}`,
      candidates: guardrailResult.filtered.slice(0, 5),
      explanation: {
        summary: this.buildSetSummary(intent, guardrailResult.filtered),
        strategy: clarificationDecision.strategy,
      },
      refinementSuggestions: this.generateRefinementSuggestions(intent, confidence),
      hasMore: guardrailResult.filtered.length > 5,
    };

    const metadata: ResponseMetadata = {
      latencyMs: Date.now() - startTime,
      modelUsed: 'gpt-4o-mini',
      tokensUsed,
      retrievalCount: initialCandidates.length,
    };

    const response: SubmitQueryResponse = {
      turnId: `turn_${Date.now()}`,
      type: clarificationDecision.strategy === 'show_with_refinement' ? 'mixed' : 'recommendations',
      recommendations,
      clarificationQuestions:
        clarificationDecision.strategy === 'show_with_refinement'
          ? clarificationDecision.questions
          : undefined,
      message: this.buildResponseMessage(intent, recommendations, confidence),
      confidence,
      parsedIntent: intent,
      metadata,
    };

    return response;
  }

  private buildClarificationResponse(
    intent: ParsedIntent,
    decision: ClarificationDecision,
    startTime: number,
    tokensUsed: number,
  ): SubmitQueryResponse {
    return {
      turnId: `turn_${Date.now()}`,
      type: 'clarification',
      clarificationQuestions: decision.questions,
      message: this.buildClarificationMessage(intent, decision.questions),
      confidence: {
        overall: intent.confidence,
        catalogCoverage: 0.5,
        intentClarity: intent.confidence,
        attributeMatchRate: 0,
        reviewSupport: 0,
        uncertaintyFactors: intent.ambiguityFactors,
        recommendation: 'low_ask_clarification',
      },
      parsedIntent: intent,
      metadata: {
        latencyMs: Date.now() - startTime,
        modelUsed: 'gpt-4o-mini',
        tokensUsed,
        retrievalCount: 0,
      },
    };
  }

  private async generateExplanations(
    candidates: RankedCandidate[],
    intent: ParsedIntent,
  ): Promise<RankedCandidate[]> {
    const attributeKeys = [
      ...intent.useCases,
      ...Object.keys(intent.attributeRequirements),
    ];

    const productIds = candidates.map((c) => c.product.id);
    const snippetsMap = await this.deps.reviewService.getRelevantSnippets(
      productIds,
      attributeKeys,
    );

    const prompt = EXPLANATION_GENERATION_PROMPT;

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const snippets = snippetsMap.get(candidate.product.id) ?? [];

        const filledPrompt = prompt
          .replace('{intent}', JSON.stringify({ need: intent.primaryNeed, useCases: intent.useCases }))
          .replace('{product}', JSON.stringify({
            name: candidate.product.name,
            brand: candidate.product.brand,
            price: candidate.product.price,
            attributes: candidate.product.attributes,
            reviewSummary: candidate.product.reviewSummary,
          }))
          .replace('{reviewHighlights}', JSON.stringify(snippets))
          .replace('{returnRisk}', JSON.stringify(candidate.product.returnStats))
          .replace('{scoreBreakdown}', JSON.stringify(candidate.score.components))
          .replace('{matchedAttributes}', JSON.stringify(candidate.matchedAttributes));

        const response = await this.deps.llm.complete({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          maxTokens: 600,
          messages: [{ role: 'user', content: filledPrompt }],
          responseFormat: 'json',
        });

        const explanation = JSON.parse(response.content);
        return { ...candidate, explanation };
      }),
    );

    return results;
  }

  private computeConfidence(
    intent: ParsedIntent,
    candidates: RankedCandidate[],
  ): ConfidenceScore {
    if (candidates.length === 0) {
      return {
        overall: 0.1,
        catalogCoverage: 0,
        intentClarity: intent.confidence,
        attributeMatchRate: 0,
        reviewSupport: 0,
        uncertaintyFactors: ['No matching products found', ...intent.ambiguityFactors],
        recommendation: 'low_ask_clarification',
      };
    }

    const topScore = candidates[0]?.score.final ?? 0;
    const avgMatchedAttrs =
      candidates.slice(0, 3).reduce((sum, c) => sum + c.matchedAttributes.length, 0) / 3;
    const expectedAttrs = Object.keys(intent.attributeRequirements).length + intent.useCases.length;
    const matchRate = expectedAttrs > 0 ? avgMatchedAttrs / expectedAttrs : 0.5;

    const avgReviewSupport =
      candidates.slice(0, 3).reduce((sum, c) => {
        return sum + (c.product.reviewSummary.totalReviews > 10 ? 0.8 : 0.3);
      }, 0) / 3;

    const overall = (
      intent.confidence * 0.3 +
      Math.min(topScore, 1) * 0.25 +
      matchRate * 0.25 +
      avgReviewSupport * 0.2
    );

    let recommendation: ConfidenceScore['recommendation'];
    if (overall > 0.7) recommendation = 'high_confidence';
    else if (overall > 0.4) recommendation = 'moderate_needs_refinement';
    else recommendation = 'low_ask_clarification';

    return {
      overall: Math.round(overall * 100) / 100,
      catalogCoverage: Math.min(candidates.length / 10, 1),
      intentClarity: intent.confidence,
      attributeMatchRate: matchRate,
      reviewSupport: avgReviewSupport,
      uncertaintyFactors: intent.ambiguityFactors,
      recommendation,
    };
  }

  private buildResponseMessage(
    intent: ParsedIntent,
    recommendations: RecommendationResponse,
    confidence: ConfidenceScore,
  ): string {
    const count = recommendations.candidates.length;
    const need = intent.primaryNeed;

    if (confidence.overall > 0.7) {
      return `Here are ${count} strong matches for ${need}. Each is selected based on your specific requirements.`;
    }
    if (confidence.overall > 0.4) {
      return `I found ${count} options for ${need}. These are my best picks, though a quick refinement could improve the results.`;
    }
    return `I have ${count} initial suggestions for ${need}, but I'd love to narrow things down to find a better fit.`;
  }

  private buildClarificationMessage(
    intent: ParsedIntent,
    questions: ClarificationQuestion[],
  ): string {
    return `I want to make sure I find the right ${intent.primaryNeed} for you. A quick question to help me narrow it down:`;
  }

  private buildSetSummary(intent: ParsedIntent, candidates: RankedCandidate[]): string {
    if (candidates.length === 0) {
      return `No products found matching "${intent.primaryNeed}". Try broadening your search.`;
    }
    const priceMin = Math.min(...candidates.map((c) => c.product.price.amount));
    const priceMax = Math.max(...candidates.map((c) => c.product.price.amount));
    const brands = [...new Set(candidates.map((c) => c.product.brand))];

    return `${candidates.length} options from ${brands.length} brands, ranging $${priceMin}–$${priceMax}.`;
  }

  private generateRefinementSuggestions(
    intent: ParsedIntent,
    confidence: ConfidenceScore,
  ): string[] {
    const suggestions: string[] = [];

    if (!intent.priceRange?.max) {
      suggestions.push('Set a budget range');
    }
    if (intent.ambiguityFactors.length > 0) {
      suggestions.push(`Specify ${intent.ambiguityFactors[0]}`);
    }
    if (confidence.attributeMatchRate < 0.5) {
      suggestions.push('Tell me more about your specific needs');
    }

    return suggestions.slice(0, 3);
  }
}
