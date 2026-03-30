import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { TenantSessionBaseDto } from './tenant-session.dto';

export class UserPreferencesDto {
  @ApiPropertyOptional({ example: 'snug' })
  @IsOptional()
  @IsString()
  fitPreference?: string;

  @ApiPropertyOptional({ example: 'toe_room' })
  @IsOptional()
  @IsString()
  betweenSizePriority?: 'toe_room' | 'locked_heel' | 'balanced';

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  style?: Record<string, unknown>;
}

export class SizeRecommendationRequestDto extends TenantSessionBaseDto {
  @ApiProperty({ example: 'prod_501' })
  @IsString()
  @MinLength(1)
  product_id!: string;

  @ApiPropertyOptional({ description: 'Body measurements or foot length, etc.' })
  @IsOptional()
  @IsObject()
  user_measurements?: Record<string, number>;

  @ApiPropertyOptional({ type: UserPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  user_preferences?: UserPreferencesDto;
}
