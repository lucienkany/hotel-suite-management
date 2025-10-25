import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsIn,
  IsOptional,
  IsInt,
} from 'class-validator';
import {
  UserRole,
  USER_ROLES,
  UserStatus,
  USER_STATUSES,
} from '../../common/constants';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsIn(USER_ROLES)
  role: UserRole;

  @IsOptional()
  @IsString()
  @IsIn(USER_STATUSES)
  status?: UserStatus;

  @IsInt()
  @IsNotEmpty()
  companyId: number;
}
