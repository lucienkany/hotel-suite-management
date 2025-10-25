import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  MaxLength,
  IsBoolean,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerType, CUSTOMER_TYPES } from '../../common/constants';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  idNumber?: string;

  @IsEnum(CustomerType, {
    message: `customerType must be one of: ${CUSTOMER_TYPES.join(', ')}`,
  })
  @IsOptional()
  customerType?: CustomerType;

  @IsBoolean()
  @IsOptional()
  hasAccount?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  creditLimit?: number;

  @IsInt()
  @IsOptional()
  sponsorCompanyId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  employeeId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;
}
