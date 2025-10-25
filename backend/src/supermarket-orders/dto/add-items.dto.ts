import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;
}

export class AddItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
