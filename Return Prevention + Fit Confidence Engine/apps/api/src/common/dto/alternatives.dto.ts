import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { TenantSessionBaseDto } from './tenant-session.dto';
import { UserContextDto } from './user-context.dto';

export class AlternativesRequestDto extends TenantSessionBaseDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  product_id!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  exclude_product_ids?: string[];

  @ApiPropertyOptional({ type: UserContextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserContextDto)
  user_context?: UserContextDto;

  @ApiPropertyOptional({ description: 'Max alternatives to return', default: 5 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  filter_state?: Record<string, unknown>;
}

export class AlternativesResponseDto {
  @ApiProperty({ type: [Object] })
  alternatives!: Array<{
    productId: string;
    variantId?: string;
    score: number;
    tradeoffs: string[];
    saferOnDimensions?: string[];
    lowerRisk: boolean;
    betterFit: boolean;
  }>;
}
