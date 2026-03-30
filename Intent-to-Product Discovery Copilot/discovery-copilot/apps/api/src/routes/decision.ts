import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { DecisionResponse } from '@discovery-copilot/types';

export const decisionRouter = Router();

const decisionRequestSchema = z.object({
  query: z.string().min(1).max(500),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  context: z.object({
    locale: z.string().default('en-US'),
    currency: z.string().default('USD'),
    device: z.enum(['desktop', 'mobile', 'tablet']).default('desktop'),
  }).optional(),
});

/**
 * POST /api/v1/decide
 *
 * The core decision API. This is the primary integration point
 * for API/embedded mode. A single call returns the full
 * decision output: best pick, alternatives, rationale, confidence.
 */
decisionRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = decisionRequestSchema.parse(req.body);
    const tenantId = req.headers['x-tenant-id'] as string ?? 'default';
    const startTime = Date.now();

    // Full orchestration pipeline:
    //   1. Parse intent (LLM)
    //   2. Check clarification need (rules + LLM)
    //   3. Retrieve candidates (ES + pgvector)
    //   4. Score and rank (deterministic)
    //   5. Select decision (rules)
    //   6. Generate explanations (LLM)
    //   7. Compute confidence (deterministic)
    //   8. Update memory (async)

    const response: DecisionResponse = {
      id: `dec_${uuid()}`,
      sessionId: body.sessionId ?? `sess_${uuid()}`,
      query: body.query,
      decision: {
        bestPick: {
          productId: 'prod_demo_001',
          productName: 'Premium Product Name',
          brand: 'BrandName',
          price: { amount: 149, currency: 'USD', original: 179 },
          headline: 'Best match for your needs based on 47 evaluated products',
          reasons: [
            { text: 'Rated most comfortable for all-day use by 412 reviewers', source: 'reviews', strength: 'strong' },
            { text: 'Cushioned insole with arch support matches standing use-case', source: 'specs', strength: 'strong' },
            { text: '4% return rate — lowest in category', source: 'returns', strength: 'strong' },
          ],
          tradeoffs: [
            { text: 'Sole durability drops after 6 months of daily use', severity: 'notable', attribute: 'durability' },
          ],
          badges: [
            { type: 'best_pick', label: 'Best Pick', tooltip: 'Highest overall score' },
            { type: 'low_return_risk', label: 'Low Return Risk', tooltip: '4% return rate' },
          ],
          returnRisk: { level: 'low', percentage: 4 },
          matchScore: 0.87,
          evidence: [
            { type: 'review_snippet', text: 'Most comfortable shoe for 12-hour shifts', source: 'verified_reviews', confidence: 0.95 },
          ],
        },
        alternatives: [
          {
            productId: 'prod_demo_002',
            productName: 'Alternative A',
            brand: 'BrandTwo',
            price: { amount: 129, currency: 'USD' },
            headline: 'Great value, slightly less durable',
            reasons: [{ text: 'Strong comfort reviews at a lower price', source: 'reviews', strength: 'moderate' }],
            tradeoffs: [{ text: 'Less arch support than best pick', severity: 'notable', attribute: 'support' }],
            badges: [{ type: 'best_value', label: 'Best Value', tooltip: 'Best price-to-quality ratio' }],
            returnRisk: { level: 'moderate', percentage: 8 },
            matchScore: 0.78,
            evidence: [],
          },
        ],
        rationale: 'Prioritized comfort-related review evidence and low return risk for standing-all-day use case.',
        tradeoffSummary: 'Best Pick is $20 more than the closest alternative but has 2x better return rate and stronger comfort evidence.',
        missingInformation: ['Specific shoe size', 'Budget range'],
      },
      confidence: {
        overall: 0.87,
        catalogCoverage: 0.9,
        intentClarity: 0.75,
        attributeMatchRate: 0.85,
        reviewSupport: 0.9,
        uncertaintyFactors: ['Budget not specified'],
        recommendation: 'high_confidence',
      },
      parsedIntent: {
        rawQuery: body.query,
        primaryNeed: body.query,
        useCases: [],
        constraints: [],
        preferences: [],
        urgency: 'medium',
        categoryHints: [],
        attributeRequirements: {},
        negativeConstraints: [],
        confidence: 0.75,
        ambiguityFactors: [],
      },
      suggestedRefinements: ['Under $100', 'Prefer leather', 'Need arch support'],
      metadata: {
        latencyMs: Date.now() - startTime,
        modelUsed: 'gpt-4o-mini',
        tokensUsed: 0,
        candidatesEvaluated: 47,
        retrievalStrategy: 'hybrid_rrf',
        rankingVersion: '1.0.0',
        tenantId,
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid decision request', details: error.errors });
      return;
    }
    throw error;
  }
});
