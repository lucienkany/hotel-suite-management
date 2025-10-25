import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType, CATEGORY_TYPES } from '../../common/constants';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Beverages' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    enum: CategoryType,
    example: CategoryType.MINIBAR,
    description: `Category type: ${CATEGORY_TYPES.join(', ')}`,
  })
  @IsEnum(CategoryType, {
    message: `categoryType must be one of: ${CATEGORY_TYPES.join(', ')}`,
  })
  @IsOptional()
  categoryType?: CategoryType;

  @ApiPropertyOptional({ example: 'PRODUCT' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
