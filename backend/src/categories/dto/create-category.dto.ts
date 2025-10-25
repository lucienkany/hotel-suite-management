import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType, CATEGORY_TYPES } from '../../common/constants';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Beverages' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: CategoryType,
    example: CategoryType.MINIBAR,
    description: `Category type: ${CATEGORY_TYPES.join(', ')}`,
  })
  @IsEnum(CategoryType, {
    message: `categoryType must be one of: ${CATEGORY_TYPES.join(', ')}`,
  })
  @IsNotEmpty()
  categoryType: CategoryType;

  @ApiProperty({ example: 'PRODUCT' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiPropertyOptional({ example: 'Drinks and beverages for minibar' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
