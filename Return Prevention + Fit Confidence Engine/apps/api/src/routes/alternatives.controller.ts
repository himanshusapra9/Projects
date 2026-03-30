import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlternativesRequestDto } from '../common/dto/alternatives.dto';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { RankingService, RankedAlternative } from '../services/ranking.service';
import { FitScoringService } from '../services/fit-scoring.service';
import { RiskScoringService } from '../services/risk-scoring.service';

@ApiTags('alternatives')
@Controller('alternatives')
export class AlternativesController {
  constructor(
    private readonly ranking: RankingService,
    private readonly fit: FitScoringService,
    private readonly risk: RiskScoringService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Alternative products with lower risk or better fit vs anchor',
  })
  @ApiBody({ type: AlternativesRequestDto })
  @ApiResponse({ status: 200 })
  async list(
    @ReqTenantId() tenantId: string,
    @Body() body: AlternativesRequestDto,
  ) {
    const suffix = body.product_id.replace(/\D/g, '') || '500';
    const n = parseInt(suffix, 10) || 500;
    const pool = [n + 1, n + 2, n + 3, n + 4, n + 5, n + 6].map((x) => `prod_alt_${x}`);
    const exclude = new Set(body.exclude_product_ids ?? []);
    const candidates = pool.filter((id) => !exclude.has(id));

    const anchorFit = this.fit.assess({
      tenantId,
      productId: body.product_id,
      userContext: body.user_context,
    });
    const anchorRisk = this.risk.profile({
      tenantId,
      productId: body.product_id,
      userContext: body.user_context,
    });

    const ranked = this.ranking.rankAlternatives({
      tenantId,
      anchorProductId: body.product_id,
      userContext: body.user_context,
      candidateProductIds: candidates,
      maxReturnRisk:
        typeof body.filter_state?.['maxReturnRisk'] === 'number' ?
          (body.filter_state['maxReturnRisk'] as number)
        : undefined,
      limit: body.limit ?? 5,
    });

    return {
      alternatives: ranked.map((r: RankedAlternative) => ({
        productId: r.productId,
        variantId: r.variantId,
        score: r.score,
        tradeoffs: r.tradeoffs,
        saferOnDimensions: r.saferOnDimensions,
        lowerRisk: r.riskComponent < anchorRisk.riskScore - 0.03,
        betterFit: r.fitComponent > anchorFit.confidence + 0.03,
      })),
    };
  }
}
