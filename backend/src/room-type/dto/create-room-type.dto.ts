import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty({ example: 'Deluxe Suite' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Spacious suite with ocean view', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  maxOccupancy: number;

  @ApiProperty({ example: 'King', required: false })
  @IsString()
  @IsOptional()
  bedType?: string;

  @ApiProperty({ example: 45, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  size?: number;

  @ApiProperty({
    example: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  images?: string[];
}
