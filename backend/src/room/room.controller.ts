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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomsService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, RoomStatus } from '../common/constants';

@ApiTags('rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    return this.roomsService.create(
      createRoomDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  findAll(
    @Request() req,
    @Query('status') status?: RoomStatus,
    @Query('roomTypeId', new ParseIntPipe({ optional: true }))
    roomTypeId?: number,
    @Query('floor', new ParseIntPipe({ optional: true })) floor?: number
  ) {
    return this.roomsService.findAll(
      req.user.companyId,
      status,
      roomTypeId,
      floor
    );
  }

  @Get('available')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  getAvailableRooms(
    @Request() req,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('roomTypeId', new ParseIntPipe({ optional: true }))
    roomTypeId?: number
  ) {
    return this.roomsService.getAvailableRooms(
      req.user.companyId,
      new Date(checkIn),
      new Date(checkOut),
      roomTypeId
    );
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Request() req
  ) {
    return this.roomsService.update(
      id,
      updateRoomDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':id/status')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST
  )
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: RoomStatus,
    @Request() req
  ) {
    return this.roomsService.updateStatus(
      id,
      status,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.roomsService.remove(id, req.user.companyId, req.user.userId);
  }
}
