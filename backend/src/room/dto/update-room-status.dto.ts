import { IsEnum, IsNotEmpty } from 'class-validator';
import { RoomStatus, ROOM_STATUSES } from '../../common/constants';

export class UpdateRoomStatusDto {
  @IsEnum(RoomStatus)
  @IsNotEmpty()
  status: RoomStatus;
}
