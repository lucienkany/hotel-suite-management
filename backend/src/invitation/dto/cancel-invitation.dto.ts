import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelInvitationDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  invitationId: number;
}
