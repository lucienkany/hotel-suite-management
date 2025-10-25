import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'My Hotel' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: 'contact@myhotel.com', required: false })
  @IsEmail()
  companyEmail: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  companyPhone?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  companyAddress?: string;
}
