import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

/** Resolved tenant from `TenantMiddleware` (after API key validation). */
export const ReqTenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const id = req.tenantId;
  if (!id) {
    throw new InternalServerErrorException('Tenant context missing');
  }
  return id;
});
