import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateRestaurantOrderItemDto } from './create-restaurant-order-item.dto';

export class AddOrderItemsDto {
  @ApiProperty({
    type: [CreateRestaurantOrderItemDto],
    description: 'Items to add to the order',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one item is required' })
  @Type(() => CreateRestaurantOrderItemDto)
  items: CreateRestaurantOrderItemDto[];
}
