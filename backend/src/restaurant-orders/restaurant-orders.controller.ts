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
import { RestaurantOrdersService } from './restaurant-orders.service';
import { CreateRestaurantOrderDto } from './dto/create-restaurant-order.dto';
import { UpdateRestaurantOrderDto } from './dto/update-restaurant-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  UserRole,
  ServiceMode,
  OrderStatus,
  PaymentStatus,
} from '../common/constants';

@ApiTags('Restaurant Orders')
@ApiBearerAuth()
@Controller('restaurant-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantOrdersController {
  constructor(
    private readonly restaurantOrdersService: RestaurantOrdersService
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a new restaurant order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createRestaurantOrderDto: CreateRestaurantOrderDto,
    @Request() req
  ) {
    return this.restaurantOrdersService.create(
      createRestaurantOrderDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all restaurant orders' })
  @ApiQuery({ name: 'stayId', required: false, type: Number })
  @ApiQuery({ name: 'clientId', required: false, type: Number })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'serviceMode', enum: ServiceMode, required: false })
  @ApiQuery({ name: 'paymentStatus', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('stayId', new ParseIntPipe({ optional: true })) stayId?: number,
    @Query('clientId', new ParseIntPipe({ optional: true })) clientId?: number,
    @Query('status') status?: OrderStatus,
    @Query('serviceMode') serviceMode?: ServiceMode,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.restaurantOrdersService.findAll(
      req.user.companyId,
      stayId,
      clientId,
      status,
      serviceMode,
      paymentStatus,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit
    );
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get restaurant order statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  getOrderStatistics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.restaurantOrdersService.getOrderStatistics(
      req.user.companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get restaurant order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantOrdersService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update restaurant order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestaurantOrderDto: UpdateRestaurantOrderDto,
    @Request() req
  ) {
    return this.restaurantOrdersService.update(
      id,
      updateRestaurantOrderDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/items')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Add items to restaurant order' })
  @ApiResponse({ status: 200, description: 'Items added successfully' })
  addItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() addOrderItemsDto: AddOrderItemsDto,
    @Request() req
  ) {
    return this.restaurantOrdersService.addItems(
      id,
      addOrderItemsDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':orderId/items/:itemId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Remove item from restaurant order' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  removeItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req
  ) {
    return this.restaurantOrdersService.removeItem(
      orderId,
      itemId,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/pay')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Process payment for restaurant order' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  payOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() payOrderDto: PayOrderDto,
    @Request() req
  ) {
    return this.restaurantOrdersService.payOrder(
      id,
      payOrderDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cancel restaurant order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantOrdersService.cancel(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete restaurant order' })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantOrdersService.remove(
      id,
      req.user.companyId,
      req.user.userId
    );
  }
}
