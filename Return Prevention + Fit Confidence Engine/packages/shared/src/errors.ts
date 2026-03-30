/** Base class for domain errors with HTTP hints. */
export abstract class FitConfidenceError extends Error {
  abstract readonly code: string;
  readonly httpStatus: number;
  readonly details?: Record<string, unknown>;

  constructor(message: string, httpStatus = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = new.target.name;
    this.httpStatus = httpStatus;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TenantNotFoundError extends FitConfidenceError {
  readonly code = 'TENANT_NOT_FOUND';
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`, 404, { tenantId });
  }
}

export class ProductNotFoundError extends FitConfidenceError {
  readonly code = 'PRODUCT_NOT_FOUND';
  constructor(productId: string, tenantId?: string) {
    super(`Product not found: ${productId}`, 404, { productId, tenantId });
  }
}

export class VariantNotFoundError extends FitConfidenceError {
  readonly code = 'VARIANT_NOT_FOUND';
  constructor(variantId: string, productId?: string) {
    super(`Variant not found: ${variantId}`, 404, { variantId, productId });
  }
}

export class InsufficientDataError extends FitConfidenceError {
  readonly code = 'INSUFFICIENT_DATA';
  constructor(reason: string, missingFields?: string[]) {
    super(reason, 422, { missingFields });
  }
}

export class InvalidRequestError extends FitConfidenceError {
  readonly code = 'INVALID_REQUEST';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends FitConfidenceError {
  readonly code = 'UNAUTHORIZED';
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class RateLimitedError extends FitConfidenceError {
  readonly code = 'RATE_LIMITED';
  constructor(retryAfterSeconds?: number) {
    super('Too many requests', 429, retryAfterSeconds != null ? { retryAfterSeconds } : undefined);
  }
}

export class UpstreamServiceError extends FitConfidenceError {
  readonly code = 'UPSTREAM_ERROR';
  constructor(service: string, cause?: string) {
    super(`Upstream service failure: ${service}`, 502, { service, cause });
  }
}

export class ScoringPipelineError extends FitConfidenceError {
  readonly code = 'SCORING_PIPELINE_ERROR';
  constructor(stage: string, cause?: string) {
    super(`Scoring failed at stage: ${stage}`, 500, { stage, cause });
  }
}
