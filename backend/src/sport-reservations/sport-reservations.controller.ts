// sport-reservations.controller.ts
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
  ApiQuery,
} from '@nestjs/swagger';
import { SportReservationsService } from './sport-reservations.service';
import { CreateSportReservationDto } from './dto/create-sport-reservation.dto';
import { UpdateSportReservationDto } from './dto/update-sport-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sport-reservations')
@ApiBearerAuth()
@Controller('sport-reservations')
@UseGuards(JwtAuthGuard)
export class SportReservationsController {
  constructor(
    private readonly sportReservationsService: SportReservationsService
  ) {}

  @Post()
  create(
    @Body() createSportReservationDto: CreateSportReservationDto,
    @Request() req
  ) {
    return this.sportReservationsService.create(
      createSportReservationDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Get()
  findAll(
    @Request() req,
    @Query('clientId') clientId?: string,
    @Query('stayId') stayId?: string,
    @Query('facilityId') facilityId?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.sportReservationsService.findAll(
      req.user.companyId,
      clientId ? parseInt(clientId) : undefined,
      stayId ? parseInt(stayId) : undefined,
      facilityId ? parseInt(facilityId) : undefined,
      status,
      paymentStatus,
      startDate,
      endDate,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50
    );
  }

  @Get('statistics')
  getStatistics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.sportReservationsService.getReservationStatistics(
      req.user.companyId,
      startDate,
      endDate
    );
  }

  @Get('availability/:facilityId')
  getAvailability(
    @Param('facilityId', ParseIntPipe) facilityId: number,
    @Query('date') date: string,
    @Request() req
  ) {
    return this.sportReservationsService.getAvailability(
      req.user.companyId,
      facilityId,
      date
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sportReservationsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSportReservationDto: UpdateSportReservationDto,
    @Request() req
  ) {
    return this.sportReservationsService.update(
      id,
      updateSportReservationDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sportReservationsService.cancel(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sportReservationsService.confirm(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sportReservationsService.complete(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.sportReservationsService.remove(
      id,
      req.user.companyId,
      req.user.userId
    );
  }
}
