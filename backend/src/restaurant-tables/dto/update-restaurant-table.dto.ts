import { PartialType } from '@nestjs/mapped-types';
import { CreateRestaurantTableDto } from './create-restaurant-table.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TableStatus } from '../../common/constants';

export class UpdateRestaurantTableDto extends PartialType(
  CreateRestaurantTableDto
) {
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;
}
