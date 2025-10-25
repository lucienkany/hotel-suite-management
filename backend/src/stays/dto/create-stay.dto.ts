import {
  IsInt,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StayStatus, STAY_STATUSES } from '../../common/constants';

export class CreateStayDto {
  @IsInt()
  @IsNotEmpty()
  roomId: number;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsDateString()
  @IsNotEmpty()
  checkInDate: string;

  @IsDateString()
  @IsNotEmpty()
  checkOutDate: string;

  @IsEnum(StayStatus, {
    message: `status must be one of: ${STAY_STATUSES.join(', ')}`,
  })
  @IsOptional()
  status?: StayStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  adults?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  children?: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  totalAmount: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  paidAmount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
