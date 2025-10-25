import {
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ServiceMode,
  OrderStatus,
  SERVICE_MODES,
  ORDER_STATUSES,
} from '../../common/constants';
import { CreateRestaurantOrderItemDto } from './create-restaurant-order-item.dto';

export class CreateRestaurantOrderDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Stay ID (optional for walk-in customers)',
  })
  @IsInt()
  @IsOptional()
  stayId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @ApiProperty({
    enum: ServiceMode,
    example: ServiceMode.WALK_IN,
    description: `Service mode: ${SERVICE_MODES.join(', ')}`,
  })
  @IsEnum(ServiceMode, {
    message: `serviceMode must be one of: ${SERVICE_MODES.join(', ')}`,
  })
  @IsNotEmpty()
  serviceMode: ServiceMode;

  @ApiPropertyOptional({ example: 'T12' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  tableNumber?: string;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: `Order status: ${ORDER_STATUSES.join(', ')}`,
  })
  @IsEnum(OrderStatus, {
    message: `status must be one of: ${ORDER_STATUSES.join(', ')}`,
  })
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({
    type: [CreateRestaurantOrderItemDto],
    description: 'Order items (at least one required)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one order item is required' })
  @Type(() => CreateRestaurantOrderItemDto)
  items: CreateRestaurantOrderItemDto[];
}
