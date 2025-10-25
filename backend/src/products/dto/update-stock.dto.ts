import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({
    example: 10,
    description: 'Quantity to add or subtract (use negative for subtraction)',
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;
}
