import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { createLogger } from '@discovery-copilot/shared';
import type { BehaviorEvent } from '@discovery-copilot/types';
import { BehaviorTrackingService } from '../services/behavior';

const logger = createLogger('api-behavior');
const behaviorService = new BehaviorTrackingService({ logger });

export const behaviorRouter = Router();

const behaviorEventTypeSchema = z.enum([
  'impression',
  'click',
  'dwell',
  'add_to_cart',
  'save',
  'compare',
  'dismiss',
  'refinement_select',
  'clarification_response',
  'purchase',
  'return',
  'repeat_visit',
  'recommendation_accept',
  'recommendation_override',
  'filter_apply',
  'filter_remove',
  'chip_click',
  'explanation_expand',
  'feedback_positive',
  'feedback_negative',
]);

const behaviorPayloadSchema = z.object({
  productId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  query: z.string().optional(),
  filterId: z.string().optional(),
  chipId: z.string().optional(),
  clarificationQuestionId: z.string().optional(),
  clarificationAnswer: z.string().optional(),
  dwellTimeMs: z.number().optional(),
  position: z.number().optional(),
  price: z.number().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  attributes: z.record(z.string()).optional(),
  overrideReason: z.string().optional(),
  returnReason: z.string().optional(),
});

const behaviorContextSchema = z.object({
  queryIntent: z.string().optional(),
  decisionId: z.string().optional(),
  recommendationPosition: z.number().optional(),
  wasAiSuggested: z.boolean().optional(),
  device: z.enum(['desktop', 'mobile', 'tablet']),
  pageType: z.enum(['search', 'landing', 'product', 'compare']),
});

const behaviorEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
  tenantId: z.string(),
  type: behaviorEventTypeSchema,
  timestamp: z.string(),
  payload: behaviorPayloadSchema,
  context: behaviorContextSchema,
});

/**
 * POST /api/v1/behavior/track — ingest a single behavior event.
 */
behaviorRouter.post('/track', async (req: Request, res: Response) => {
  try {
    const body = behaviorEventSchema.parse(req.body) as BehaviorEvent;
    await behaviorService.ingestEvent(body);
    res.status(202).json({ accepted: true, eventId: body.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid behavior event',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    logger.error('behavior.track failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
});

/**
 * POST /api/v1/behavior/batch — batch ingest.
 */
behaviorRouter.post('/batch', async (req: Request, res: Response) => {
  try {
    const schema = z.object({ events: z.array(behaviorEventSchema).min(1).max(500) });
    const body = schema.parse(req.body);
    const events = body.events as BehaviorEvent[];
    const result = await behaviorService.ingestBatch(events);
    res.status(202).json({ accepted: result.ok, failed: result.failed });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid batch',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});

/**
 * GET /api/v1/behavior/signals/:userId — extracted signals for personalization.
 */
behaviorRouter.get('/signals/:userId', async (req: Request, res: Response) => {
  try {
    const userId = typeof req.params.userId === 'string' ? req.params.userId : req.params.userId[0];
    const extraction = await behaviorService.getExtractedSignals(userId);
    res.json(extraction);
  } catch (error) {
    logger.error('behavior.signals failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
});
