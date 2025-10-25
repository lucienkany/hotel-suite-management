import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { RoomStatus, ROOM_STATUSES } from '../../common/constants';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  roomNumber?: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsInt()
  @IsOptional()
  roomTypeId?: number;

  @IsEnum(RoomStatus, {
    message: `status must be one of: ${ROOM_STATUSES.join(', ')}`,
  })
  @IsOptional()
  status?: RoomStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
