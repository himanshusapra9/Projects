import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    tenantId?: string;
    apiKeyId?: string;
    rateLimitBucket?: { remaining: number; limit: number; resetUnix: number };
  }
}
