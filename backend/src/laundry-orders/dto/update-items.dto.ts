import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateItemDto {
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
