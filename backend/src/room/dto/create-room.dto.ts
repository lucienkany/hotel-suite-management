import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { RoomStatus, ROOM_STATUSES } from '../../common/constants';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  roomNumber: string;

  @IsInt()
  @IsNotEmpty()
  floor: number;

  @IsInt()
  @IsNotEmpty()
  roomTypeId: number;

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
