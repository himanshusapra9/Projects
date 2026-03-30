import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityFeedbackService } from '../services/community-feedback.service';

@ApiTags('community')
@Controller('community-feedback')
export class CommunityController {
  constructor(private readonly community: CommunityFeedbackService) {}

  @Get(':productId')
  @ApiOperation({ summary: 'Aggregated community feedback summary for a product' })
  @ApiParam({ name: 'productId', example: 'prod_501' })
  @ApiResponse({ status: 200 })
  summary(@Param('productId') productId: string) {
    return this.community.summary(productId);
  }
}
