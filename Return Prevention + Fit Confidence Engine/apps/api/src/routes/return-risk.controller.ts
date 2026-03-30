import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReturnRiskRequestDto } from '../common/dto/return-risk.dto';
import { ReturnRiskProfile } from '../common/types/api-responses.types';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { RiskScoringService } from '../services/risk-scoring.service';

@ApiTags('return-risk')
@Controller('return-risk')
export class ReturnRiskController {
  constructor(private readonly risk: RiskScoringService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Return-risk profile with factors and interventions' })
  @ApiBody({ type: ReturnRiskRequestDto })
  @ApiResponse({ status: 200 })
  async profile(
    @ReqTenantId() tenantId: string,
    @Body() body: ReturnRiskRequestDto,
  ): Promise<ReturnRiskProfile> {
    return this.risk.profile({
      tenantId,
      productId: body.product_id,
      variantId: body.variant_id,
      userContext: body.user_context,
    });
  }
}
