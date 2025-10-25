import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, ORDER_STATUSES } from '../../common/constants';

export class UpdateRestaurantOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PREPARING,
    description: `Order status: ${ORDER_STATUSES.join(', ')}`,
  })
  @IsEnum(OrderStatus, {
    message: `status must be one of: ${ORDER_STATUSES.join(', ')}`,
  })
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'T15' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  tableNumber?: string;
}
