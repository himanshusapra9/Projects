import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { TenantKeysService } from '../services/tenant-keys.service';

/**
 * Validates `x-api-key`, attaches `tenantId` and `apiKeyId` to the request.
 * Body `tenant_id` must match resolved tenant when both are present.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly keys: TenantKeysService,
    private readonly config: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const skipAuth =
      this.config.get<string>('NODE_ENV') === 'development' &&
      this.config.get<string>('SKIP_API_KEY') === 'true';

    if (skipAuth) {
      req.tenantId = 'tenant_dev_1';
      req.apiKeyId = 'dev-bypass';
      return next();
    }

    const headerKey =
      (req.headers['x-api-key'] as string | undefined) ??
      (req.headers['authorization'] as string | undefined)?.replace(/^Bearer\s+/i, '');

    const resolved = this.keys.resolveTenant(headerKey);
    if (!resolved) {
      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Missing or invalid x-api-key',
      });
    }

    req.tenantId = resolved.tenantId;
    req.apiKeyId = resolved.keyId;

    const bodyTenant =
      typeof req.body === 'object' && req.body !== null && 'tenant_id' in req.body
        ? (req.body as { tenant_id?: string }).tenant_id
        : undefined;

    if (bodyTenant && bodyTenant !== resolved.tenantId) {
      throw new UnauthorizedException({
        error: 'TENANT_MISMATCH',
        message: 'tenant_id does not match API key',
      });
    }

    next();
  }
}
