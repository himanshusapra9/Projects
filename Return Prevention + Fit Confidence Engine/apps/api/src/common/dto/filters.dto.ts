import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { TenantSessionBaseDto } from './tenant-session.dto';

export class FiltersSuggestRequestDto extends TenantSessionBaseDto {
  @ApiProperty({ example: 'prod_501' })
  @IsString()
  @MinLength(1)
  product_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Current filter state from client' })
  @IsOptional()
  @IsObject()
  filter_state?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'User intent or search query' })
  @IsOptional()
  @IsString()
  query?: string;
}

export class FilterSuggestionChip {
  id!: string;
  label!: string;
  appliedFilterPatch!: Record<string, unknown>;
  rationale!: string;
}

export class FiltersSuggestResponseDto {
  suggestedFilters!: Array<{ key: string; value: unknown; rationale: string }>;
  chips!: FilterSuggestionChip[];
}
