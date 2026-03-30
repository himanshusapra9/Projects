import type { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { createLogger } from '@discovery-copilot/shared';

const logger = createLogger('error-handler');

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = uuid();

  logger.error('Unhandled error', {
    requestId,
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    requestId,
  });
}
