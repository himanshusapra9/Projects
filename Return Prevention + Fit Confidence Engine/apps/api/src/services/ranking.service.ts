import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../common/dto/user-context.dto';
import { FitScoringService } from './fit-scoring.service';
import { RiskScoringService } from './risk-scoring.service';

export interface RankedAlternative {
  productId: string;
  variantId?: string;
  score: number;
  fitComponent: number;
  riskComponent: number;
  tradeoffs: string[];
  saferOnDimensions?: string[];
}

@Injectable()
export class RankingService {
  constructor(
    private readonly fit: FitScoringService,
    private readonly risk: RiskScoringService,
  ) {}

  rankAlternatives(input: {
    tenantId: string;
    anchorProductId: string;
    userContext?: UserContextDto;
    candidateProductIds: string[];
    maxReturnRisk?: number;
    limit?: number;
  }): RankedAlternative[] {
    const lambda = 0.35;
    const limit = input.limit ?? 5;

    const rows: RankedAlternative[] = [];

    for (const pid of input.candidateProductIds) {
      const fit = this.fit.assess({
        tenantId: input.tenantId,
        productId: pid,
        userContext: input.userContext,
      });
      const rr = this.risk.profile({
        tenantId: input.tenantId,
        productId: pid,
        userContext: input.userContext,
      });

      if (input.maxReturnRisk !== undefined && rr.riskScore > input.maxReturnRisk) {
        continue;
      }

      const prefBoost = this.preferenceBoost(pid, input.userContext);
      const composite = Math.max(
        0,
        Math.min(1, fit.confidence * (1 - lambda * rr.riskScore) + prefBoost * 0.05),
      );

      const tradeoffs = this.tradeoffs(fit.confidence, rr.riskScore, pid, input.anchorProductId);
      const saferOnDimensions = this.saferDims(fit, rr);

      rows.push({
        productId: pid,
        variantId: `var_${pid.split('_').pop()}_default`,
        score: composite,
        fitComponent: fit.confidence,
        riskComponent: rr.riskScore,
        tradeoffs,
        saferOnDimensions,
      });
    }

    rows.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.riskComponent !== b.riskComponent) return a.riskComponent - b.riskComponent;
      return a.productId.localeCompare(b.productId);
    });

    return rows.slice(0, limit);
  }

  private preferenceBoost(productId: string, ctx?: UserContextDto): number {
    const must = ctx?.constraints?.mustHave ?? [];
    let boost = 0;
    for (const m of must) {
      if (productId.includes(m) || m.length < 3) boost += 0.2;
    }
    return Math.min(1, boost);
  }

  private tradeoffs(
    fit: number,
    risk: number,
    productId: string,
    anchor: string,
  ): string[] {
    const t: string[] = [];
    if (fit > 0.72) t.push('Stronger measured alignment vs anchor');
    else t.push('Similar silhouette with broader size overlap');
    if (risk < 0.45) t.push('Lower historical mismatch signal');
    if (productId < anchor) t.push('Lexicographic tie-break (stable ordering)');
    return t.slice(0, 3);
  }

  private saferDims(
    fit: { dimensions: Array<{ key: string; score: number }> },
    risk: { factors: Array<{ code: string; weight: number }> },
  ): string[] {
    const dims = fit.dimensions
      .filter((d) => d.score >= 0.6)
      .map((d) => d.key);
    const drivers = risk.factors
      .filter((f) => f.weight > 0.2)
      .map((f) => f.code);
    return Array.from(new Set([...dims.slice(0, 2), ...drivers.slice(0, 1)]));
  }
}
