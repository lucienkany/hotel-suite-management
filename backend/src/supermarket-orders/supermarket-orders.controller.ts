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
  ApiQuery,
} from '@nestjs/swagger';
import { SupermarketOrdersService } from './supermarket-orders.service';
import { CreateSupermarketOrderDto } from './dto/create-supermarket-order.dto';
import { UpdateSupermarketOrderDto } from './dto/update-supermarket-order.dto';
import { AddItemsDto } from './dto/add-items.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus, PaymentStatus, ServiceMode } from '../common/constants';

@ApiTags('supermarket-orders')
@ApiBearerAuth()
@Controller('supermarket-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupermarketOrdersController {
  constructor(
    private readonly supermarketOrdersService: SupermarketOrdersService
  ) {}

  @Post()
  @Roles('admin', 'manager', 'receptionist', 'staff')
  create(
    @Body() createSupermarketOrderDto: CreateSupermarketOrderDto,
    @Request() req
  ) {
    return this.supermarketOrdersService.create(
      createSupermarketOrderDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Get()
  @Roles('admin', 'manager', 'receptionist', 'staff')
  findAll(
    @Request() req,
    @Query('clientId', new ParseIntPipe({ optional: true })) clientId?: number,
    @Query('stayId', new ParseIntPipe({ optional: true })) stayId?: number,
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('serviceMode') serviceMode?: ServiceMode,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.supermarketOrdersService.findAll(
      req.user.companyId,
      clientId,
      stayId,
      status,
      paymentStatus,
      serviceMode,
      startDate,
      endDate,
      page,
      limit
    );
  }

  @Get('statistics')
  @Roles('admin', 'manager')
  getStatistics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.supermarketOrdersService.getOrderStatistics(
      req.user.companyId,
      startDate,
      endDate
    );
  }

  @Get(':id')
  @Roles('admin', 'manager', 'receptionist', 'staff')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.supermarketOrdersService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'receptionist', 'staff')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupermarketOrderDto: UpdateSupermarketOrderDto,
    @Request() req
  ) {
    return this.supermarketOrdersService.update(
      id,
      updateSupermarketOrderDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/items')
  @Roles('admin', 'manager', 'receptionist', 'staff')
  @HttpCode(HttpStatus.OK)
  addItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() addItemsDto: AddItemsDto,
    @Request() req
  ) {
    return this.supermarketOrdersService.addItems(
      id,
      addItemsDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':orderId/items/:itemId')
  @Roles('admin', 'manager', 'receptionist', 'staff')
  updateItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req
  ) {
    return this.supermarketOrdersService.updateItem(
      orderId,
      itemId,
      updateItemDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':orderId/items/:itemId')
  @Roles('admin', 'manager', 'receptionist', 'staff')
  @HttpCode(HttpStatus.OK)
  removeItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req
  ) {
    return this.supermarketOrdersService.removeItem(
      orderId,
      itemId,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/cancel')
  @Roles('admin', 'manager', 'receptionist')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.supermarketOrdersService.cancel(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/complete')
  @Roles('admin', 'manager', 'receptionist', 'staff')
  @HttpCode(HttpStatus.OK)
  complete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.supermarketOrdersService.complete(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.supermarketOrdersService.remove(
      id,
      req.user.companyId,
      req.user.userId
    );
  }
}
