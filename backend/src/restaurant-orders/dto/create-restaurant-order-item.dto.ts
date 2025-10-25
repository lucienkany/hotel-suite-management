import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;
}
