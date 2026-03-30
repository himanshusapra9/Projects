import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

const EVENT_TYPES = [
  'IMPRESSION',
  'CLICK',
  'ADD_TO_CART',
  'PURCHASE',
  'RETURN',
  'PDP_VIEW',
  'SIZE_TOGGLE',
  'FILTER_APPLY',
] as const;

export class BehaviorEventItemDto {
  @ApiProperty({ enum: EVENT_TYPES as unknown as string[] })
  @IsString()
  @IsIn([...EVENT_TYPES])
  type!: (typeof EVENT_TYPES)[number];

  @ApiProperty({ type: Object })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-03-30T12:00:00.000Z' })
  @IsOptional()
  @IsString()
  ts?: string;
}

export class BehaviorEventsRequestDto {
  @ApiProperty({ example: 'tenant_dev_1' })
  @IsString()
  @MinLength(1)
  tenant_id!: string;

  @ApiProperty({ example: 'sess_abc' })
  @IsString()
  @MinLength(1)
  session_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ type: [BehaviorEventItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BehaviorEventItemDto)
  events!: BehaviorEventItemDto[];
}
