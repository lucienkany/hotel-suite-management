import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendInvitationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  invitationId: number;
}
