import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FitConfidenceRequestDto } from '../common/dto/fit-confidence.dto';
import { FitConfidenceAssessment } from '../common/types/api-responses.types';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { FitScoringService } from '../services/fit-scoring.service';

@ApiTags('fit-confidence')
@Controller('fit-confidence')
export class FitConfidenceController {
  constructor(private readonly fitScoring: FitScoringService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Compute fit confidence assessment for a product context' })
  @ApiBody({ type: FitConfidenceRequestDto })
  @ApiResponse({ status: 200, description: 'Fit confidence assessment' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assess(
    @ReqTenantId() tenantId: string,
    @Body() body: FitConfidenceRequestDto,
  ): Promise<FitConfidenceAssessment> {
    return this.fitScoring.assess({
      tenantId,
      productId: body.product_id,
      variantId: body.variant_id,
      userContext: body.user_context,
    });
  }
}
