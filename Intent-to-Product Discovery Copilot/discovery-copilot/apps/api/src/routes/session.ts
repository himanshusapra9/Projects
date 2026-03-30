import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { StartSessionRequest, StartSessionResponse } from '@discovery-copilot/types';

export const sessionRouter = Router();

const startSessionSchema = z.object({
  anonymousId: z.string().optional(),
  userId: z.string().optional(),
  context: z.object({
    userAgent: z.string(),
    device: z.enum(['desktop', 'mobile', 'tablet']),
    locale: z.string(),
    currency: z.string(),
    geoRegion: z.string().optional(),
    referrer: z.string().optional(),
    entryPoint: z.string(),
  }),
});

sessionRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = startSessionSchema.parse(req.body) as StartSessionRequest;

    const sessionId = `sess_${uuid()}`;
    const anonymousId = body.anonymousId ?? `anon_${uuid()}`;

    // In production: persist session to Postgres + Redis cache
    // For MVP: in-memory store (see services/session-store.ts)

    let welcomeMessage = "Hi! Tell me what you're looking for, and I'll help you find the right product.";
    let memorySummary: string | undefined;
    const suggestedQueries: string[] = [];

    if (body.userId) {
      // Load user memory for personalized welcome
      // memorySummary = await memoryService.getSummary(body.userId);
      welcomeMessage = "Welcome back! What can I help you find today?";
      suggestedQueries.push(
        'Something similar to my last purchase',
        'Gift ideas under $50',
      );
    }

    const response: StartSessionResponse = {
      sessionId,
      welcomeMessage,
      memorySummary,
      suggestedQueries,
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});

sessionRouter.get('/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  // In production: fetch from Postgres/Redis
  // For MVP: return mock
  res.json({
    id: sessionId,
    status: 'active',
    turns: [],
    startedAt: new Date().toISOString(),
  });
});
