import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';
import {
  UserRole,
  USER_ROLES,
  UserStatus,
  USER_STATUSES,
} from '../../common/constants';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsIn(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
}
