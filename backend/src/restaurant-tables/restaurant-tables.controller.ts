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
import { RestaurantTablesService } from './restaurant-tables.service';
import { CreateRestaurantTableDto } from './dto/create-restaurant-table.dto';
import { UpdateRestaurantTableDto } from './dto/update-restaurant-table.dto';
import { AssignTableDto } from './dto/assign-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TableStatus } from '../common/constants';

@ApiTags('restaurant-tables')
@ApiBearerAuth()
@Controller('restaurant-tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantTablesController {
  constructor(
    private readonly restaurantTablesService: RestaurantTablesService
  ) {}

  @Post()
  @Roles('admin', 'manager')
  create(
    @Body() createRestaurantTableDto: CreateRestaurantTableDto,
    @Request() req
  ) {
    return this.restaurantTablesService.create(
      createRestaurantTableDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Get()
  @Roles('admin', 'manager', 'receptionist', 'waiter')
  findAll(
    @Request() req,
    @Query('status') status?: TableStatus,
    @Query('minCapacity', new ParseIntPipe({ optional: true }))
    minCapacity?: number,
    @Query('location') location?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.restaurantTablesService.findAll(
      req.user.companyId,
      status,
      minCapacity,
      location,
      page,
      limit
    );
  }

  @Get('statistics')
  @Roles('admin', 'manager')
  getStatistics(@Request() req) {
    return this.restaurantTablesService.getTableStatistics(req.user.companyId);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'receptionist', 'waiter')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRestaurantTableDto: UpdateRestaurantTableDto,
    @Request() req
  ) {
    return this.restaurantTablesService.update(
      id,
      updateRestaurantTableDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/assign')
  @Roles('admin', 'manager', 'waiter')
  @HttpCode(HttpStatus.OK)
  assignTable(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTableDto: AssignTableDto,
    @Request() req
  ) {
    return this.restaurantTablesService.assignTable(
      id,
      assignTableDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/clear')
  @Roles('admin', 'manager', 'waiter')
  @HttpCode(HttpStatus.OK)
  clearTable(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.clearTable(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/reserve')
  @Roles('admin', 'manager', 'waiter')
  @HttpCode(HttpStatus.OK)
  reserveTable(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.reserveTable(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/unreserve')
  @Roles('admin', 'manager', 'waiter')
  @HttpCode(HttpStatus.OK)
  unreserveTable(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.unreserveTable(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.remove(
      id,
      req.user.companyId,
      req.user.userId
    );
  }
}
