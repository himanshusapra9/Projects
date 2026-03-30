import { z } from 'zod';

const uuidLike = z.string().min(8).max(64);

export const TenantHeaderSchema = z.object({
  'x-tenant-id': uuidLike,
});

export const MeasurementsSchema = z.record(z.string(), z.number());

export const UserContextSchema = z
  .object({
    measurements: MeasurementsSchema.optional(),
    measurementUnit: z.enum(['IN', 'CM']).optional(),
    answers: z.record(z.string(), z.unknown()).optional(),
    statedUseCase: z.string().optional(),
    constraints: z
      .object({
        maxPrice: z
          .object({ amount: z.string(), currency: z.string() })
          .optional(),
        mustHave: z.array(z.string()).optional(),
        avoid: z.array(z.string()).optional(),
      })
      .optional(),
    priorVariantPurchases: z.array(z.string()).optional(),
  })
  .strict();

export const RecommendationRequestSchema = z
  .object({
    product_id: z.string().min(1),
    user_id: z.string().optional(),
    mode: z.enum(['PDP', 'SEARCH', 'COMPARE']).optional(),
    user_context: UserContextSchema.optional(),
    candidate_variant_ids: z.array(z.string()).optional(),
    filter_state: z
      .object({
        maxReturnRisk: z.number().min(0).max(1).optional(),
        brandIds: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .strict();

export const FitConfidenceRequestSchema = z
  .object({
    tenantId: z.string(),
    productId: z.string().min(1),
    variantId: z.string().optional(),
    userContext: UserContextSchema.optional(),
  })
  .strict();

export const ReturnRiskRequestSchema = FitConfidenceRequestSchema;

export const SizeRecommendationRequestSchema = z
  .object({
    tenantId: z.string(),
    productId: z.string().min(1),
    measurements: MeasurementsSchema.optional(),
    preferences: z
      .object({
        fitPreference: z.string().optional(),
        betweenSizePriority: z.enum(['toe_room', 'locked_heel', 'balanced']).optional(),
      })
      .optional(),
  })
  .strict();

export const FitDimensionScoreSchema = z.object({
  key: z.string(),
  label: z.string(),
  score: z.number(),
  weight: z.number(),
  detail: z.string().optional(),
});

export const UncertaintySchema = z.object({
  epistemic: z.number(),
  aleatoric: z.number(),
  total: z.number(),
});

export const FitConfidenceResponseSchema = z.object({
  confidence: z.number(),
  categoryKind: z.string(),
  dimensions: z.array(FitDimensionScoreSchema),
  betweenSizeNote: z.string().optional(),
  uncertainty: UncertaintySchema,
});

export const RiskFactorSchema = z.object({
  code: z.string(),
  label: z.string(),
  weight: z.number(),
  preventable: z.boolean(),
});

export const InterventionSchema = z.object({
  id: z.string(),
  kind: z.enum(['INFO', 'WARN', 'SOFT_BLOCK', 'SUGGEST_ALT']),
  message: z.string(),
  thresholdCrossed: z.string().optional(),
});

export const ReturnRiskResponseSchema = z.object({
  riskScore: z.number(),
  preventableShare: z.number(),
  nonPreventableShare: z.number(),
  factors: z.array(RiskFactorSchema),
  interventions: z.array(InterventionSchema),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
export type UserContext = z.infer<typeof UserContextSchema>;
export type FitConfidenceRequest = z.infer<typeof FitConfidenceRequestSchema>;
export type SizeRecommendationRequest = z.infer<typeof SizeRecommendationRequestSchema>;
