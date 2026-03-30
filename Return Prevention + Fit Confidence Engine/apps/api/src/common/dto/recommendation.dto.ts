import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  Equals,
} from 'class-validator';
import { TenantSessionBaseDto } from './tenant-session.dto';
import { UserContextDto } from './user-context.dto';

export class FilterStateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  price?: { min?: number; max?: number; currency: string };

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  brandIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  maxReturnRisk?: number;
}

export class RecommendationRequestDto extends TenantSessionBaseDto {
  @ApiProperty({ example: '1.0.0' })
  @Equals('1.0.0')
  schema_version!: '1.0.0';

  @ApiProperty({ example: 'prod_501' })
  @IsString()
  @MinLength(1)
  product_id!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  candidate_variant_ids?: string[];

  @ApiPropertyOptional({ type: UserContextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserContextDto)
  user_context?: UserContextDto;

  @ApiPropertyOptional({ type: FilterStateDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterStateDto)
  filter_state?: FilterStateDto;

  @ApiPropertyOptional({ enum: ['PDP', 'CART', 'COMPARE', 'SEARCH'] })
  @IsOptional()
  @IsIn(['PDP', 'CART', 'COMPARE', 'SEARCH'])
  mode?: 'PDP' | 'CART' | 'COMPARE' | 'SEARCH';
}
