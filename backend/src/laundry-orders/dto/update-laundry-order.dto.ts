import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import {
  OrderStatus,
  PaymentStatus,
  ServiceMode,
} from '../../common/constants';

export class UpdateLaundryOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(ServiceMode)
  @IsOptional()
  serviceMode?: ServiceMode;

  @IsDateString()
  @IsOptional()
  pickupDate?: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;
}
