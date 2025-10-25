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
import { LaundryOrdersService } from './laundry-orders.service';
import { CreateLaundryOrderDto } from './dto/create-laundry-order.dto';
import { UpdateLaundryOrderDto } from './dto/update-laundry-order.dto';
import { AddItemsDto } from './dto/add-items.dto';
import { UpdateItemDto } from './dto/update-items.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderStatus, PaymentStatus, ServiceMode } from '../common/constants';

@ApiTags('laundry-orders')
@ApiBearerAuth()
@Controller('laundry-orders')
@UseGuards(JwtAuthGuard)
export class LaundryOrdersController {
  constructor(private readonly laundryOrdersService: LaundryOrdersService) {}

  @Post()
  create(@Body() createLaundryOrderDto: CreateLaundryOrderDto, @Request() req) {
    return this.laundryOrdersService.create(
      createLaundryOrderDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Get()
  findAll(
    @Request() req,
    @Query('clientId') clientId?: string,
    @Query('stayId') stayId?: string,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('serviceMode') serviceMode?: ServiceMode,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.laundryOrdersService.findAll(
      req.user.companyId,
      clientId ? parseInt(clientId) : undefined,
      stayId ? parseInt(stayId) : undefined,
      status,
      paymentStatus,
      serviceMode,
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
    return this.laundryOrdersService.getOrderStatistics(
      req.user.companyId,
      startDate,
      endDate
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.laundryOrdersService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLaundryOrderDto: UpdateLaundryOrderDto,
    @Request() req
  ) {
    return this.laundryOrdersService.update(
      id,
      updateLaundryOrderDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/items')
  addItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() addItemsDto: AddItemsDto,
    @Request() req
  ) {
    return this.laundryOrdersService.addItems(
      id,
      addItemsDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':orderId/items/:itemId')
  updateItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req
  ) {
    return this.laundryOrdersService.updateItem(
      orderId,
      itemId,
      updateItemDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':orderId/items/:itemId')
  removeItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req
  ) {
    return this.laundryOrdersService.removeItem(
      orderId,
      itemId,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.laundryOrdersService.cancel(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.laundryOrdersService.complete(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.laundryOrdersService.remove(
      id,
      req.user.companyId,
      req.user.userId
    );
  }
}
