import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Coca Cola 330ml' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 'piece' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  unit?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock?: number;
}
