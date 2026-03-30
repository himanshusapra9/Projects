import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SizeRecommendationRequestDto } from '../common/dto/size-recommendation.dto';
import { SizeRecommendation, SizeAlternative } from '../common/types/api-responses.types';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { FitScoringService } from '../services/fit-scoring.service';
import { RiskScoringService } from '../services/risk-scoring.service';

@ApiTags('size-recommendation')
@Controller('size-recommendation')
export class SizeRecommendationController {
  constructor(
    private readonly fit: FitScoringService,
    private readonly risk: RiskScoringService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Recommend size / variant with between-size handling',
  })
  @ApiBody({ type: SizeRecommendationRequestDto })
  @ApiResponse({ status: 200 })
  async recommend(
    @ReqTenantId() tenantId: string,
    @Body() body: SizeRecommendationRequestDto,
  ): Promise<SizeRecommendation> {
    const rec = this.fit.recommendSize(
      body.product_id,
      body.user_measurements,
      body.user_preferences,
    );

    const alternatives: SizeAlternative[] = rec.neighborScores.map((n) => {
      const rr = this.risk.profile({
        tenantId,
        productId: body.product_id,
        variantId: n.variantId,
        userContext: {
          measurements: body.user_measurements,
          measurementUnit: body.user_measurements?.['chest_cm'] ? 'CM' : 'IN',
        },
      });
      return {
        variantId: n.variantId,
        label: n.label,
        fitScore: n.fit,
        riskPenalty: rr.riskScore,
        composite: n.composite * (1 - 0.25 * rr.riskScore),
      };
    });

    alternatives.sort((a, b) => b.composite - a.composite);

    const topRisk = this.risk.profile({
      tenantId,
      productId: body.product_id,
      variantId: rec.primaryVariantId,
      userContext: { measurements: body.user_measurements },
    });

    const confidence =
      alternatives[0]?.composite ??
      Math.max(0.2, 0.75 - (rec.between ? 0.12 : 0));

    return {
      recommendedSize: rec.primaryLabel,
      recommendedVariantId: rec.primaryVariantId,
      confidence,
      betweenSize: rec.between,
      rationale: rec.between
        ? 'Scores for neighboring sizes are close; priority (toe room vs locked heel) breaks the tie.'
        : 'Highest composite fit vs risk-adjusted score among neighboring variants.',
      alternatives,
      measurementUnit: body.user_measurements?.['chest_cm'] ? 'CM' : 'IN',
    };
  }
}
