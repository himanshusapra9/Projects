import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BehaviorEventsRequestDto } from '../common/dto/behavior.dto';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { BehaviorIngestService } from '../services/behavior-ingest.service';

@ApiTags('behavior')
@Controller()
export class BehaviorController {
  constructor(private readonly behavior: BehaviorIngestService) {}

  @Post('events')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Ingest behavior events (impressions, clicks, ATC, purchases, returns)',
  })
  @ApiBody({ type: BehaviorEventsRequestDto })
  @ApiResponse({ status: 202, description: 'Accepted' })
  ingest(@ReqTenantId() tenantId: string, @Body() body: BehaviorEventsRequestDto) {
    const result = this.behavior.append(
      tenantId,
      body.session_id,
      body.user_id,
      body.events,
    );
    return { accepted: result.accepted, status: 'accepted' };
  }
}
