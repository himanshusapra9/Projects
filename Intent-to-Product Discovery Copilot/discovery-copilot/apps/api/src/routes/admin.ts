import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import type { EvaluationRunRequest, EvaluationRunResponse } from '@discovery-copilot/types';

export const adminRouter = Router();

const evalRunSchema = z.object({
  datasetId: z.string(),
  modelVersion: z.string().optional(),
  rankingVersion: z.string().optional(),
  sampleSize: z.number().positive().optional(),
});

adminRouter.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const body = evalRunSchema.parse(req.body) as EvaluationRunRequest;

    // In production:
    //   1. Validate dataset exists
    //   2. Queue evaluation job via BullMQ
    //   3. Job runs each query through the pipeline, compares against gold labels
    //   4. Computes NDCG, MRR, clarification precision/recall, etc.
    //   5. Stores results for dashboard consumption

    const response: EvaluationRunResponse = {
      runId: `eval_${uuid()}`,
      status: 'queued',
      estimatedDurationMs: (body.sampleSize ?? 100) * 2000,
    };

    res.status(202).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid evaluation request',
        details: error.errors,
        requestId: uuid(),
      });
      return;
    }
    throw error;
  }
});

adminRouter.get('/evaluate/:runId', async (req: Request, res: Response) => {
  const { runId } = req.params;

  // In production: fetch job status and partial results
  res.json({
    runId,
    status: 'running',
    progress: { completed: 0, total: 100 },
  });
});

adminRouter.get('/metrics/online', async (_req: Request, res: Response) => {
  // In production: aggregate from analytics warehouse
  res.json({
    period: 'last_7_days',
    metrics: {
      avgCtr: 0,
      avgAddToCartRate: 0,
      avgConversionRate: 0,
      avgRevenuePerSession: 0,
      avgReturnRate: 0,
      avgTurnsPerSession: 0,
      avgTimeToFirstResultMs: 0,
      totalSessions: 0,
    },
  });
});

adminRouter.get('/experiments', async (_req: Request, res: Response) => {
  // In production: fetch active A/B tests
  res.json({ experiments: [] });
});
