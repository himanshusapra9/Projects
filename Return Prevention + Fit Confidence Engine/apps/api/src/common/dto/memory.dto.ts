import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class MemoryPreferenceDto {
  @ApiProperty({ example: 'footwear.widthPreference' })
  @IsString()
  @MinLength(1)
  key!: string;

  @ApiProperty({ example: 'WIDE' })
  value!: unknown;

  @ApiPropertyOptional({ enum: ['EXPLICIT', 'INFERRED'] })
  @IsOptional()
  @IsString()
  provenance?: 'EXPLICIT' | 'INFERRED';
}

export class MemoryPutDto {
  @ApiProperty({ example: 'tenant_dev_1' })
  @IsString()
  @MinLength(1)
  tenant_id!: string;

  @ApiPropertyOptional({ example: 'cat_footwear' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({ type: [MemoryPreferenceDto] })
  @ValidateNested({ each: true })
  @Type(() => MemoryPreferenceDto)
  prefs!: MemoryPreferenceDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  provenance?: Record<string, 'EXPLICIT' | 'INFERRED'>;
}
