import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { TenantSessionBaseDto } from './tenant-session.dto';
import { UserContextDto } from './user-context.dto';

export class FitConfidenceRequestDto extends TenantSessionBaseDto {
  @ApiProperty({ example: 'prod_501' })
  @IsString()
  @MinLength(1)
  product_id!: string;

  @ApiPropertyOptional({ example: 'var_9001' })
  @IsOptional()
  @IsString()
  variant_id?: string;

  @ApiPropertyOptional({ type: UserContextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserContextDto)
  user_context?: UserContextDto;
}
