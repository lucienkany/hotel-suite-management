import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/constants';

export class SendInvitationDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'newuser@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Role to assign to the new user',
    enum: UserRole,
    example: UserRole.STAFF,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;
}
