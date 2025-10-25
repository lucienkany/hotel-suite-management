// dto/create-sport-reservation.dto.ts
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';

export class CreateSportReservationDto {
  @IsInt()
  clientId: number;

  @IsInt()
  @IsOptional()
  stayId?: number;

  @IsInt()
  facilityId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
