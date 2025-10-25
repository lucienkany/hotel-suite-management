import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomTypeService } from './room-type.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('room-types')
@Controller('room-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  create(@Body() createRoomTypeDto: CreateRoomTypeDto, @Request() req) {
    return this.roomTypeService.create(
      createRoomTypeDto,
      req.user.companyId,
      req.user.id
    );
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return this.roomTypeService.findAll(
      req.user.companyId,
      page,
      limit,
      search,
      sortBy,
      sortOrder
    );
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.roomTypeService.getStats(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomTypeService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
    @Request() req
  ) {
    return this.roomTypeService.update(
      id,
      updateRoomTypeDto,
      req.user.companyId,
      req.user.id
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomTypeService.remove(id, req.user.companyId, req.user.id);
  }
}
