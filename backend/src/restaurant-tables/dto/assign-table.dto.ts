import { IsInt } from 'class-validator';

export class AssignTableDto {
  @IsInt()
  orderId: number;
}
