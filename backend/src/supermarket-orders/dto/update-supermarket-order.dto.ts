import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../../common/constants';

export class UpdateSupermarketOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
