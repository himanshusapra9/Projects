import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UserConstraintsDto {
  @ApiPropertyOptional()
  @IsOptional()
  maxPrice?: { amount: string; currency: string };

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  mustHave?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  avoid?: string[];
}

export class UserContextDto {
  @ApiPropertyOptional({ description: 'Normalized measurements (e.g. chest_in, foot_length_cm)' })
  @IsOptional()
  @IsObject()
  measurements?: Record<string, number>;

  @ApiPropertyOptional({ enum: ['IN', 'CM'] })
  @IsOptional()
  @IsIn(['IN', 'CM'])
  measurementUnit?: 'IN' | 'CM';

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statedUseCase?: string;

  @ApiPropertyOptional({ type: UserConstraintsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserConstraintsDto)
  constraints?: UserConstraintsDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  priorVariantPurchases?: string[];
}
