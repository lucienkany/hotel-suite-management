import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateRestaurantTableDto {
  @IsString()
  tableNumber: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
