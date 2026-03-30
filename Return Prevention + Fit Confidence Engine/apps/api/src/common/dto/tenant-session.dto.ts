import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class TenantSessionBaseDto {
  @ApiProperty({ example: 'tenant_dev_1' })
  @IsString()
  @MinLength(1)
  tenant_id!: string;

  @ApiProperty({ example: 'sess_abc123' })
  @IsString()
  @MinLength(1)
  session_id!: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @MinLength(1)
  user_id?: string;
}
