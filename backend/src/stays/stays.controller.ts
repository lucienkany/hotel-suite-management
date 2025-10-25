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
import { StaysService } from './stays.service';
import { CreateStayDto } from './dto/create-stay.dto';
import { UpdateStayDto } from './dto/update-stay.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, StayStatus } from '../common/constants';

@ApiTags('stays')
@Controller('stays')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaysController {
  constructor(private readonly staysService: StaysService) {}

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST
  )
  create(@Body() createStayDto: CreateStayDto, @Request() req) {
    return this.staysService.create(
      createStayDto,
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
    @Query('status') status?: StayStatus,
    @Query('roomId', new ParseIntPipe({ optional: true })) roomId?: number,
    @Query('clientId', new ParseIntPipe({ optional: true })) clientId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.staysService.findAll(
      req.user.companyId,
      status,
      roomId,
      clientId,
      startDate,
      endDate,
      page,
      limit
    );
  }

  @Get('active')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  getActiveStays(@Request() req) {
    return this.staysService.getActiveStays(req.user.companyId);
  }

  @Get('upcoming')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  getUpcomingStays(
    @Request() req,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number
  ) {
    return this.staysService.getUpcomingStays(req.user.companyId, days);
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
    return this.staysService.findOne(id, req.user.companyId);
  }

  @Get(':id/statistics')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  getStayStatistics(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.staysService.getStayStatistics(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStayDto: UpdateStayDto,
    @Request() req
  ) {
    return this.staysService.update(
      id,
      updateStayDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/check-in')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST
  )
  checkIn(
    @Param('id', ParseIntPipe) id: number,
    @Body() checkInDto: CheckInDto,
    @Request() req
  ) {
    return this.staysService.checkIn(
      id,
      checkInDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/check-out')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST
  )
  checkOut(
    @Param('id', ParseIntPipe) id: number,
    @Body() checkOutDto: CheckOutDto,
    @Request() req
  ) {
    return this.staysService.checkOut(
      id,
      checkOutDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.staysService.cancel(id, req.user.companyId, req.user.userId);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.staysService.remove(id, req.user.companyId, req.user.userId);
  }
}
