import { IsDateString, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsDateString()
  @IsOptional()
  actualCheckIn?: string;
}
