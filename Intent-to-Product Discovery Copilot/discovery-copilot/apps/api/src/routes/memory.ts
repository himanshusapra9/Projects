import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { GetMemoryResponse, UpdateMemoryResponse } from '@discovery-copilot/types';

export const memoryRouter = Router();

const updateMemorySchema = z.object({
  userId: z.string(),
  preferences: z.record(z.unknown()).optional(),
  clearHistory: z.boolean().optional(),
});

memoryRouter.get('/:userId', async (req: Request, res: Response) => {
  const userId =
    typeof req.params.userId === 'string' ? req.params.userId : req.params.userId[0];

  // In production:
  //   1. Fetch from long_term_memory table
  //   2. Generate natural language summary via LLM
  //   3. Cache in Redis for fast session startup

  const response: GetMemoryResponse = {
    memory: {
      userId,
      preferences: {
        budgetSensitivity: 'medium',
        preferredBrands: [],
        dislikedBrands: [],
        stylePreferences: {},
        useCasePreferences: [],
        sizeProfiles: [],
        returnSensitivity: 'medium',
        sustainabilityPriority: false,
        qualityOverPrice: 0.6,
      },
      sessionSummaries: [],
      productInteractions: [],
      learnedPreferences: [],
      updatedAt: new Date().toISOString(),
    },
    summary: 'No prior shopping history yet.',
  };

  res.json(response);
});

memoryRouter.put('/', async (req: Request, res: Response) => {
  try {
    const body = updateMemorySchema.parse(req.body);

    // In production:
    //   1. Merge new preferences with existing
    //   2. If clearHistory, soft-delete session summaries
    //   3. Invalidate Redis cache

    const response: UpdateMemoryResponse = {
      success: true,
      updatedAt: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid memory update',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});

memoryRouter.delete('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  // GDPR compliance: full deletion of user memory
  // In production: hard delete from DB + invalidate cache

  res.json({ success: true, deletedAt: new Date().toISOString() });
});
