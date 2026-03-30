import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MemoryPutDto } from '../common/dto/memory.dto';
import { ReqTenantId } from '../common/decorators/tenant-id.decorator';
import { MemoryStoreService } from '../services/memory-store.service';

@ApiTags('memory')
@Controller('memory')
export class MemoryController {
  constructor(private readonly memory: MemoryStoreService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get stored preferences for a user' })
  @ApiParam({ name: 'userId', example: 'usr_77' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  getOne(@ReqTenantId() tenantId: string, @Param('userId') userId: string) {
    const row = this.memory.get(tenantId, userId);
    if (!row) {
      throw new NotFoundException({ error: 'NOT_FOUND', message: 'No memory for user' });
    }
    return row;
  }

  @Put(':userId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Upsert user preferences' })
  @ApiParam({ name: 'userId', example: 'usr_77' })
  @ApiBody({ type: MemoryPutDto })
  @ApiResponse({ status: 200 })
  put(
    @ReqTenantId() tenantId: string,
    @Param('userId') userId: string,
    @Body() body: MemoryPutDto,
  ) {
    return this.memory.upsert(tenantId, userId, { ...body, tenant_id: tenantId });
  }

  @Delete(':userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete stored memory for a user' })
  @ApiParam({ name: 'userId', example: 'usr_77' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  remove(@ReqTenantId() tenantId: string, @Param('userId') userId: string) {
    const ok = this.memory.delete(tenantId, userId);
    if (!ok) {
      throw new NotFoundException({ error: 'NOT_FOUND', message: 'No memory for user' });
    }
  }
}
