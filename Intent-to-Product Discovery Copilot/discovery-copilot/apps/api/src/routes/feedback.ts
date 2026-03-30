import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { SubmitFeedbackRequest, TrackEventRequest } from '@discovery-copilot/types';

export const feedbackRouter = Router();

const feedbackSchema = z.object({
  sessionId: z.string(),
  type: z.enum([
    'impression', 'click', 'add_to_cart', 'purchase', 'return',
    'thumbs_up', 'thumbs_down', 'clarification_answered', 'clarification_skipped',
    'refinement_requested', 'explanation_expanded', 'comparison_opened',
    'session_abandoned', 'session_completed',
  ]),
  productId: z.string().optional(),
  recommendationSetId: z.string().optional(),
  turnIndex: z.number(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const trackSchema = z.object({
  sessionId: z.string(),
  events: z.array(z.object({
    type: z.string(),
    productId: z.string().optional(),
    recommendationSetId: z.string().optional(),
    position: z.number().optional(),
    metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
    timestamp: z.string(),
  })),
});

feedbackRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = feedbackSchema.parse(req.body) as SubmitFeedbackRequest;

    // In production:
    //   1. Persist to feedback events table
    //   2. Push to analytics pipeline (Kafka/SQS)
    //   3. If thumbs_down, record rejection reason in session memory
    //   4. If purchase, trigger memory update job

    res.json({
      eventId: `evt_${uuid()}`,
      acknowledged: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid feedback payload',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});

feedbackRouter.post('/track', async (req: Request, res: Response) => {
  try {
    const body = trackSchema.parse(req.body) as TrackEventRequest;

    // Batch insert into analytics pipeline
    // In production, this is a fire-and-forget to a queue

    res.json({
      received: body.events.length,
      acknowledged: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid tracking payload',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});
