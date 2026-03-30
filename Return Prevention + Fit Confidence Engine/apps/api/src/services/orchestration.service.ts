import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ClarificationQuestion,
  DecisionResponse,
  RecommendedAction,
} from '../common/types/decision.types';
import { RecommendationRequestDto } from '../common/dto/recommendation.dto';
import { FitScoringService } from './fit-scoring.service';
import { RiskScoringService } from './risk-scoring.service';
import { RankingService, RankedAlternative } from './ranking.service';
import { MemoryStoreService } from './memory-store.service';

@Injectable()
export class OrchestrationService {
  constructor(
    private readonly fit: FitScoringService,
    private readonly risk: RiskScoringService,
    private readonly ranking: RankingService,
    private readonly memory: MemoryStoreService,
  ) {}

  async decide(
    dto: RecommendationRequestDto,
    requestTenantId: string,
  ): Promise<DecisionResponse> {
    const t0 = Date.now();
    const requestId = randomUUID();

    const userContext = { ...(dto.user_context ?? {}) };
    if (dto.user_id) {
      const mem = this.memory.get(requestTenantId, dto.user_id);
      if (mem) {
        userContext.answers = {
          ...(typeof mem.prefs === 'object' ? mem.prefs : {}),
          ...(userContext.answers ?? {}),
        } as Record<string, unknown>;
      }
    }

    const variantIds =
      dto.candidate_variant_ids?.length ?
        dto.candidate_variant_ids
      : [`var_${dto.product_id}_default`];

    const fit = this.fit.assess({
      tenantId: requestTenantId,
      productId: dto.product_id,
      variantId: variantIds[0],
      userContext,
    });

    const rr = this.risk.profile({
      tenantId: requestTenantId,
      productId: dto.product_id,
      variantId: variantIds[0],
      userContext,
    });

    const tauWarn = 0.55;
    const needAlts =
      fit.confidence < 0.62 ||
      rr.riskScore > tauWarn ||
      fit.uncertainty.total > 0.42;

    const neighborIds = this.syntheticNeighbors(dto.product_id);
    const alts = needAlts
      ? this.ranking.rankAlternatives({
          tenantId: requestTenantId,
          anchorProductId: dto.product_id,
          userContext,
          candidateProductIds: neighborIds,
          maxReturnRisk: dto.filter_state?.maxReturnRisk,
          limit: 4,
        })
      : [];

    const action = this.chooseAction(fit.confidence, rr.riskScore, fit.uncertainty.total);
    const clarification = this.planClarification(dto.product_id, fit, userContext, action);

    const explanation = this.composeExplanation(fit, rr, action);

    const refinement =
      dto.mode === 'SEARCH' || dto.mode === 'COMPARE' ?
        {
          suggestedFilters: [
            {
              key: 'maxReturnRisk',
              value: Math.min(0.45, rr.riskScore + 0.05),
              rationale: 'Narrow to lower historical mismatch',
            },
          ],
          chips: [
            {
              id: 'lower_risk',
              label: 'Lower return risk',
              appliedFilterPatch: { maxReturnRisk: 0.4 },
            },
            {
              id: 'same_brand',
              label: 'Same brand',
              appliedFilterPatch: { brandIds: ['inferred'] },
            },
          ],
        }
      : undefined;

    const memoryBlock =
      dto.user_id ?
        {
          applied: !!this.memory.get(requestTenantId, dto.user_id),
          deltas: [{ key: 'session.rescore', action: 'SET' as const }],
        }
      : undefined;

    const response: DecisionResponse = {
      schemaVersion: '1.0.0',
      requestId,
      tenantId: requestTenantId,
      productId: dto.product_id,
      resolvedVariantIds: variantIds,
      recommendedVariantIds: [variantIds[0]],
      recommendedAction: action,
      fitConfidence: fit.confidence,
      returnRisk: rr.riskScore,
      uncertainty: fit.uncertainty,
      clarification,
      alternatives: alts.map((a: RankedAlternative) => ({
        productId: a.productId,
        variantId: a.variantId,
        score: a.score,
        tradeoffs: a.tradeoffs,
        saferOnDimensions: a.saferOnDimensions,
      })),
      explanation,
      refinement,
      memory: memoryBlock,
      debug: {
        featureVectorVersion: 'fv_rules_1.2.0',
        modelVersion: 'risk_rules_0.9.1',
        latencyMs: Date.now() - t0,
      },
    };

    return response;
  }

  private chooseAction(
    fit: number,
    risk: number,
    uncertainty: number,
  ): RecommendedAction {
    if (uncertainty > 0.48 && fit < 0.75) return 'CLARIFY';
    if (risk > 0.72 && fit < 0.82) return 'CONSIDER_ALTERNATIVE';
    if (fit >= 0.78 && risk <= 0.38) return 'BUY';
    if (risk > 0.55 && fit >= 0.65) return 'CONSIDER_ALTERNATIVE';
    if (uncertainty > 0.4) return 'CLARIFY';
    if (fit < 0.58) return 'REFINE';
    return 'COMPARE';
  }

  private planClarification(
    productId: string,
    fit: { uncertainty: { total: number; epistemic: number; aleatoric: number } },
    userContext: Record<string, unknown> | undefined,
    action: RecommendedAction,
  ):
    | {
        maxQuestions: number;
        questions: ClarificationQuestion[];
        reasonCodes: string[];
      }
    | undefined {
    if (action !== 'CLARIFY' && fit.uncertainty.total < 0.35) {
      return undefined;
    }
    const measurements = (userContext as { measurements?: Record<string, number> })?.measurements;
    const category = this.fit.resolveCategory(productId);
    const missingWidth =
      !measurements?.['width_code'] &&
      !measurements?.['foot_width'] &&
      category === 'FOOTWEAR';

    const questions: ClarificationQuestion[] = [];
    if (missingWidth) {
      questions.push({
        id: 'q_width',
        text: 'What width do you usually wear for this brand or category?',
        type: 'SINGLE_CHOICE',
        options: [
          { id: 'narrow', label: 'Narrow', value: 'NARROW' },
          { id: 'medium', label: 'Medium / D', value: 'MEDIUM' },
          { id: 'wide', label: 'Wide', value: 'WIDE' },
        ],
        required: true,
        mapsToFeatureKeys: ['width_code_match', 'footwear.widthPreference'],
      });
    }
    if (fit.uncertainty.epistemic > 0.38) {
      questions.push({
        id: 'q_use_case',
        text: 'What is your primary use case for this item?',
        type: 'SINGLE_CHOICE',
        options: [
          { id: 'daily', label: 'Daily / all-day', value: 'DAILY' },
          { id: 'sport', label: 'Sport / training', value: 'SPORT' },
          { id: 'occasional', label: 'Occasional', value: 'OCCASIONAL' },
        ],
        required: false,
        mapsToFeatureKeys: ['use_case_standing_hours', 'performance_mismatch'],
      });
    }
    if (questions.length === 0 && action === 'CLARIFY') {
      questions.push({
        id: 'q_brand_size',
        text: 'What size do you most often take in comparable products?',
        type: 'TEXT',
        required: false,
        mapsToFeatureKeys: ['brand_curve_alignment'],
      });
    }

    const maxQuestions = Math.min(3, questions.length || 1);
    if (questions.length === 0) return undefined;

    return {
      maxQuestions,
      questions: questions.slice(0, 3),
      reasonCodes: ['HIGH_UNCERTAINTY', 'MISSING_MEASUREMENT', 'EPISTEMIC_GAP'].slice(
        0,
        questions.length,
      ),
    };
  }

  private composeExplanation(
    fit: { confidence: number; dimensions: Array<{ key: string; score: number }> },
    rr: { riskScore: number; factors: Array<{ code: string; weight: number }> },
    action: RecommendedAction,
  ): DecisionResponse['explanation'] {
    const topDim = [...fit.dimensions].sort((a, b) => b.score - a.score)[0];
    const topRisk = rr.factors[0];
    return {
      summary: `Action ${action}: fit ${(fit.confidence * 100).toFixed(0)}% vs return-risk ${(rr.riskScore * 100).toFixed(0)}%.`,
      bullets: [
        {
          text: `Strongest dimension: ${topDim?.key ?? 'n/a'} (${(topDim.score * 100).toFixed(0)}%).`,
          featureIds: topDim ? [topDim.key] : [],
        },
        {
          text: `Top risk driver: ${topRisk?.code ?? 'UNKNOWN'} (${(topRisk.weight * 100).toFixed(0)}% weight).`,
          featureIds: topRisk ? [`risk_${topRisk.code}`] : [],
        },
      ],
      citations: [
        {
          source: 'MODEL',
          id: 'feature_export',
          snippet: 'Scores from deterministic rules + priors',
          weight: 0.6,
        },
      ],
    };
  }

  private syntheticNeighbors(anchor: string): string[] {
    const suffix = anchor.replace(/\D/g, '') || '500';
    const n = parseInt(suffix, 10) || 500;
    return [`prod_alt_${n + 1}`, `prod_alt_${n + 2}`, `prod_alt_${n + 3}`];
  }
}
