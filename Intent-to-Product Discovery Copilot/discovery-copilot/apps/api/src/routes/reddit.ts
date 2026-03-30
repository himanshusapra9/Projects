import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { createLogger } from '@discovery-copilot/shared';
import { RedditEnrichmentService } from '../services/reddit-enrichment';

const logger = createLogger('api-reddit');
const redditService = new RedditEnrichmentService({
  logger,
  isRedditEnabledForTenant: async () => true,
});

export const redditRouter = Router();

const enrichBodySchema = z.object({
  tenantId: z.string().min(1),
  productId: z.string().optional(),
  category: z.string().min(1),
  query: z.string().min(1),
  brand: z.string().optional(),
  attributes: z.array(z.string()).optional(),
});

/**
 * POST /api/v1/reddit/enrich — community feedback enrichment (Reddit).
 */
redditRouter.post('/enrich', async (req: Request, res: Response) => {
  try {
    const body = enrichBodySchema.parse(req.body);
    const result = await redditService.enrich({
      tenantId: body.tenantId,
      productId: body.productId,
      category: body.category,
      query: body.query,
      brand: body.brand,
      attributes: body.attributes,
    });
    const display = redditService.toCommunityFeedbackDisplay(result);
    res.json({
      enrichment: result,
      /** UI-ready community feedback copy — always labeled as community-sourced. */
      communityFeedbackDisplay: display,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid enrich body',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    logger.error('reddit.enrich route failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
});

/**
 * GET /api/v1/reddit/insights/:productId — cached community insights for a product.
 */
redditRouter.get('/insights/:productId', async (req: Request, res: Response) => {
  try {
    const productId = typeof req.params.productId === 'string' ? req.params.productId : req.params.productId[0];
    const tenantId = typeof req.query.tenantId === 'string' ? req.query.tenantId : '';
    if (!tenantId) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Query parameter tenantId is required',
        requestId: uuid(),
      });
      return;
    }

    const cached = await redditService.getCachedInsights(tenantId, productId);
    if (!cached) {
      res.status(404).json({
        code: 'NOT_FOUND',
        message: 'No cached Reddit insights for this product. Call POST /enrich first.',
        requestId: uuid(),
      });
      return;
    }

    res.json({
      insights: cached,
      communityFeedbackDisplay: redditService.toCommunityFeedbackDisplay(cached),
    });
  } catch (error) {
    logger.error('reddit.insights route failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
});
