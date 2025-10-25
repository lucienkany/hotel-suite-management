import { IsDateString, IsOptional } from 'class-validator';

export class CheckOutDto {
  @IsDateString()
  @IsOptional()
  actualCheckOut?: string;
}
