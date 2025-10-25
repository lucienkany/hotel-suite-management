import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Coca Cola 330ml' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 'piece' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit: string;

  @ApiPropertyOptional({ example: 'Refreshing cola drink' })
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
