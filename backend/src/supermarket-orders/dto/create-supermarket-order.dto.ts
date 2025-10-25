import {
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceMode } from '../../common/constants';

class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;
}

export class CreateSupermarketOrderDto {
  @IsInt()
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
}
