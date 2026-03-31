import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RequestUser } from '@/auth/interfaces/request-user.interface';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Dashboard KPI summary' })
  async summary(@CurrentUser() user: RequestUser) {
    const data = await this.analytics.summary(user.organizationId);
    return { success: true, data };
  }

  @Get('completeness')
  @ApiOperation({ summary: 'Per-channel listing completeness / quality' })
  async completeness(@CurrentUser() user: RequestUser) {
    const data = await this.analytics.completenessByChannel(user.organizationId);
    return { success: true, data };
  }
}
