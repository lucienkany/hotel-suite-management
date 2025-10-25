import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayOrderDto {
  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'CASH' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'Payment for table 12' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ example: 'REF-12345' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;
}
