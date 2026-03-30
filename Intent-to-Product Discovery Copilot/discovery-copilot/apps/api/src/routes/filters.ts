import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { AiSuggestedFilters, FilterConfig, FilterDefinition, HardFilter, SmartChip } from '@discovery-copilot/types';

export const filtersRouter = Router();

const filterSuggestSchema = z.object({
  query: z.string().min(1).max(500),
  category: z.string().min(1),
  sessionId: z.string().optional(),
  tenantId: z.string().optional(),
});

const hardFilterSchema: z.ZodType<HardFilter> = z.object({
  id: z.string().optional(),
  attribute: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'range', 'exists']),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.tuple([z.number(), z.number()]),
  ]),
  label: z.string(),
  source: z.enum(['user', 'system']),
  removable: z.boolean(),
});

const filterApplySchema = z.object({
  category: z.string().min(1),
  query: z.string().optional(),
  hardFilters: z.array(hardFilterSchema).default([]),
  /** Candidate IDs from retrieval to re-rank (optional stub if empty). */
  candidateProductIds: z.array(z.string()).optional(),
  sessionId: z.string().optional(),
});

/**
 * GET /api/v1/filters/:category — available filters for a category.
 */
filtersRouter.get('/:category', async (req: Request, res: Response) => {
  try {
    const raw = typeof req.params.category === 'string' ? req.params.category : req.params.category[0];
    const category = decodeURIComponent(raw);
    const config = buildFilterConfigForCategory(category);
    res.json({ category, config });
  } catch (error) {
    res.status(400).json({
      code: 'BAD_REQUEST',
      message: error instanceof Error ? error.message : 'Invalid category',
      requestId: uuid(),
    });
  }
});

/**
 * POST /api/v1/filters/suggest — AI-suggested filters (structured; LLM can replace heuristics).
 */
filtersRouter.post('/suggest', async (req: Request, res: Response) => {
  try {
    const body = filterSuggestSchema.parse(req.body);
    const suggested = buildAiSuggestedFilters(body.query, body.category);
    const response: { suggestions: AiSuggestedFilters; category: string } = {
      category: body.category,
      suggestions: suggested,
    };
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid suggest body',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});

/**
 * POST /api/v1/filters/apply — apply filters and return re-ranked product order.
 */
filtersRouter.post('/apply', async (req: Request, res: Response) => {
  try {
    const body = filterApplySchema.parse(req.body);
    const ranked = applyFiltersAndRank(body.candidateProductIds ?? [], body.hardFilters);
    res.json({
      category: body.category,
      query: body.query,
      appliedFilters: body.hardFilters,
      rankedProductIds: ranked,
      rankingChanged: ranked.length > 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid apply body',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});

function buildFilterConfigForCategory(category: string): FilterConfig {
  const base: FilterDefinition[] = [
    {
      attribute: 'price',
      label: 'Price',
      type: 'price_range',
      range: { min: 0, max: 5000, step: 10, unit: 'USD' },
      categorySpecific: false,
      priority: 1,
    },
    {
      attribute: 'brand',
      label: 'Brand',
      type: 'multi_select',
      options: [],
      categorySpecific: true,
      priority: 2,
    },
    {
      attribute: 'rating',
      label: 'Minimum rating',
      type: 'rating',
      range: { min: 1, max: 5, step: 0.5 },
      categorySpecific: false,
      priority: 3,
    },
  ];

  if (/shoe|apparel|clothing/i.test(category)) {
    base.push({
      attribute: 'size',
      label: 'Size',
      type: 'select',
      categorySpecific: true,
      priority: 4,
    });
  }

  return {
    category,
    availableFilters: base,
    defaultChips: defaultChipsForCategory(category),
    requiredFilters: [],
  };
}

function defaultChipsForCategory(category: string): SmartChip[] {
  return [
    {
      id: 'chip_budget',
      label: 'Budget picks',
      type: 'price',
      action: { kind: 'set_price_cap', amount: 150, currency: 'USD' },
      active: false,
      aiSuggested: true,
      explanation: 'Prioritize lower prices in this category.',
    },
    {
      id: 'chip_quality',
      label: 'Top rated',
      type: 'quality',
      action: { kind: 'set_trait', trait: 'rating', direction: 'require' },
      active: false,
      aiSuggested: false,
    },
  ];
}

function buildAiSuggestedFilters(query: string, category: string): AiSuggestedFilters {
  const q = query.toLowerCase();
  const chips: SmartChip[] = [];

  if (/\b(cheap|budget|affordable|under)\b/.test(q)) {
    chips.push({
      id: 'suggest_price',
      label: 'Cap price',
      type: 'price',
      action: { kind: 'set_price_cap', amount: 100, currency: 'USD' },
      active: false,
      aiSuggested: true,
      explanation: 'Query signals budget sensitivity.',
    });
  }

  if (/\b(quiet|silent|noise)\b/.test(q)) {
    chips.push({
      id: 'suggest_quiet',
      label: 'Low noise',
      type: 'trait',
      action: { kind: 'set_trait', trait: 'noise', direction: 'prefer' },
      active: false,
      aiSuggested: true,
      explanation: 'Intent mentions noise.',
    });
  }

  if (chips.length === 0) {
    chips.push({
      id: 'suggest_category',
      label: `Refine ${category}`,
      type: 'category',
      action: {
        kind: 'custom_refinement',
        query_modifier: query,
      },
      active: false,
      aiSuggested: true,
    });
  }

  return {
    chips,
    explanation: 'Suggested filters are inferred from query intent and category norms.',
    basedOn: ['query_intent', 'category_norms'],
  };
}

/** Deterministic re-ranking placeholder — swap with ranking package integration. */
function applyFiltersAndRank(candidateProductIds: string[], _hardFilters: HardFilter[]): string[] {
  if (candidateProductIds.length === 0) {
    return [];
  }
  return [...candidateProductIds];
}
