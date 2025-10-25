import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupCompanyDto {
  @ApiProperty({ example: 'Acme Hotels Inc.' })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({
    example: 'acmehotels.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({
    example: '123 Main Street, New York, NY 10001',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiProperty({ example: 'admin@acmehotels.com' })
  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  adminPassword: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  adminLastName?: string;
}
