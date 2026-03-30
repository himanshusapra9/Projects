import { Injectable } from '@nestjs/common';
import {
  Intervention,
  ReturnRiskProfile,
  RiskFactor,
} from '../common/types/api-responses.types';
import { UserContextDto } from '../common/dto/user-context.dto';
import { FitScoringService } from './fit-scoring.service';

const PREVENTABLE = new Set([
  'SIZE_TOO_SMALL',
  'SIZE_TOO_LARGE',
  'WIDTH_MISMATCH',
  'LENGTH_MISMATCH',
  'COLOR_NOT_AS_EXPECTED',
  'MATERIAL_FEEL_MISMATCH',
  'PERFORMANCE_MISMATCH',
  'COMFORT_FIT',
]);

@Injectable()
export class RiskScoringService {
  constructor(private readonly fit: FitScoringService) {}

  profile(input: {
    tenantId: string;
    productId: string;
    variantId?: string;
    userContext?: UserContextDto;
  }): ReturnRiskProfile {
    const category = this.fit.resolveCategory(input.productId);
    const skuLift = this.skuPrior(input.productId, input.variantId);
    const reviewPenalty = 0.12 + this.hash01(input.productId, 11) * 0.25;
    const subjective = category === 'FOOTWEAR' || category === 'APPAREL' ? 0.18 : 0.12;
    const behaviorSpike = this.sessionSpike(input.userContext);

    const skuVolatility = 0.08 * this.hash01(input.productId, 17);
    const z =
      0.55 * skuLift +
      0.25 * reviewPenalty +
      0.15 * subjective -
      0.1 * behaviorSpike +
      (input.userContext?.constraints?.avoid?.length ? 0.05 : 0) +
      skuVolatility;

    const riskScore = Math.max(0.02, Math.min(0.98, 1 / (1 + Math.exp(-4 * (z - 0.45)))));

    const factors = this.decomposeFactors(riskScore, category, input.productId);
    const preventableWeight = factors.filter((f) => f.preventable).reduce((a, f) => a + f.weight, 0);
    const totalW = factors.reduce((a, f) => a + f.weight, 0) || 1;
    const preventableShare = preventableWeight / totalW;
    const nonPreventableShare = 1 - preventableShare;

    const interventions = this.interventions(riskScore, factors);

    return {
      riskScore,
      preventableShare,
      nonPreventableShare,
      factors,
      interventions,
    };
  }

  private skuPrior(productId: string, variantId?: string): number {
    const h = this.hash01(productId + (variantId ?? ''), 3);
    return 0.15 + h * 0.55;
  }

  private sessionSpike(ctx?: UserContextDto): number {
    if (!ctx?.priorVariantPurchases?.length) return 0;
    return Math.min(0.4, ctx.priorVariantPurchases.length * 0.08);
  }

  private hash01(seed: string, salt: number): number {
    let h = salt;
    for (let i = 0; i < seed.length; i++) {
      h = (h * 37 + seed.charCodeAt(i)) >>> 0;
    }
    return (h % 10000) / 10000;
  }

  private decomposeFactors(
    risk: number,
    category: string,
    productId: string,
  ): RiskFactor[] {
    const codes: Array<[string, string]> = [
      ['SIZE_TOO_LARGE', 'Historical size-too-large share'],
      ['WIDTH_MISMATCH', 'Width / volume mismatch'],
      ['COMFORT_FIT', 'Subjective comfort variance'],
      ['COLOR_NOT_AS_EXPECTED', 'Color / expectation gap'],
      ['CHANGED_MIND', 'Non-preventable preference change'],
    ];
    const factors: RiskFactor[] = codes.map(([code, label], i) => {
      const w = (0.15 + this.hash01(productId, i + 7) * 0.35) * (0.7 + risk * 0.5);
      return {
        code,
        weight: Math.round(w * 1000) / 1000,
        preventable: PREVENTABLE.has(code),
        label,
      };
    });
    factors.sort((a, b) => b.weight - a.weight);
    return factors;
  }

  private interventions(risk: number, factors: RiskFactor[]): Intervention[] {
    const tauInfo = 0.35;
    const tauWarn = 0.55;
    const tauSoft = 0.72;
    const out: Intervention[] = [];

    if (risk > tauInfo) {
      out.push({
        id: 'info_band',
        kind: 'INFO',
        message: 'Slightly elevated mismatch vs category baseline—review sizing notes.',
        thresholdCrossed: 'tau_info',
      });
    }
    if (risk > tauWarn) {
      out.push({
        id: 'warn_alternatives',
        kind: 'WARN',
        message: 'Consider width or half-size alternatives if available.',
        thresholdCrossed: 'tau_warn',
      });
    }
    if (risk > tauSoft) {
      out.push({
        id: 'soft_block_review_alts',
        kind: 'SOFT_BLOCK',
        message: 'Higher than typical return-risk for this category—compare substitutes.',
        thresholdCrossed: 'tau_soft_block',
      });
    }

    const top = factors[0];
    if (top?.preventable) {
      out.push({
        id: 'target_driver',
        kind: 'SUGGEST_ALT',
        message: `Primary driver: ${top.label} (${top.code}).`,
      });
    }
    return out;
  }
}
