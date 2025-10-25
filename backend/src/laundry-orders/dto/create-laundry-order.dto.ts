import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceMode } from '../../common/constants';

class OrderItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}

export class CreateLaundryOrderDto {
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsInt()
  @IsOptional()
  stayId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(ServiceMode)
  @IsOptional()
  serviceMode?: ServiceMode;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsDateString()
  @IsOptional()
  pickupDate?: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;
}
