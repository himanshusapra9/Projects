import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { TenantKeysService } from '../services/tenant-keys.service';

type Bucket = { count: number; windowStart: number };

/**
 * Simple sliding-window rate limit per API key (in-memory).
 * Production: back with Redis using the same key scheme.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly config: ConfigService,
    private readonly keys: TenantKeysService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const windowMs = 60_000;
    const keyId = req.apiKeyId ?? 'anonymous';
    const kind = req.apiKeyId ? this.keys.getKeyKind(req.apiKeyId) : 'SERVER';
    const limit =
      kind === 'WIDGET'
        ? parseInt(this.config.get<string>('RATE_LIMIT_RPM_WIDGET') ?? '600', 10)
        : parseInt(this.config.get<string>('RATE_LIMIT_RPM_SERVER') ?? '3000', 10);

    const now = Date.now();
    let b = this.buckets.get(keyId);
    if (!b || now - b.windowStart >= windowMs) {
      b = { count: 0, windowStart: now };
      this.buckets.set(keyId, b);
    }

    b.count += 1;
    const resetUnix = Math.ceil((b.windowStart + windowMs) / 1000);
    const remaining = Math.max(0, limit - b.count);

    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(resetUnix));

    if (b.count > limit) {
      res.setHeader('Retry-After', String(Math.ceil(windowMs / 1000)));
      throw new HttpException(
        {
          error: 'RATE_LIMITED',
          message: 'Too many requests for this API key',
          retryAfterSeconds: Math.ceil(windowMs / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    req.rateLimitBucket = { remaining, limit, resetUnix };
    next();
  }
}
