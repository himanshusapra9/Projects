import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecommendationRequestDto } from '../common/dto/recommendation.dto';
import { DecisionResponse } from '../common/types/decision.types';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { OrchestrationService } from '../services/orchestration.service';

@ApiTags('recommend')
@Controller('recommend')
export class RecommendationController {
  constructor(private readonly orchestration: OrchestrationService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Full decision orchestration (fit, risk, alternatives, clarification)',
  })
  @ApiBody({ type: RecommendationRequestDto })
  @ApiResponse({ status: 200, description: 'DecisionResponse' })
  async recommend(
    @ReqTenantId() tenantId: string,
    @Body() body: RecommendationRequestDto,
  ): Promise<DecisionResponse> {
    return this.orchestration.decide(body, tenantId);
  }
}
