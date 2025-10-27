import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TableStatus, UserRole } from '../common/constants';
import { AssignTableDto } from './dto/assign-table.dto';
import { CreateRestaurantTableDto } from './dto/create-restaurant-table.dto';
import { UpdateRestaurantTableDto } from './dto/update-restaurant-table.dto';
import { RestaurantTablesService } from './restaurant-tables.service';

@ApiTags('restaurant-tables')
@ApiBearerAuth()
@Controller('restaurant-tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantTablesController {
  constructor(
    private readonly restaurantTablesService: RestaurantTablesService
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
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
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.STAFF
  )
  findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('minCapacity') minCapacity?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    // Parse optional parameters manually to avoid ParseIntPipe issues
    const parsedMinCapacity = minCapacity
      ? parseInt(minCapacity, 10)
      : undefined;
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    return this.restaurantTablesService.findAll(
      req.user.companyId,
      status as TableStatus,
      parsedMinCapacity,
      location,
      parsedPage,
      parsedLimit
    );
  }

  @Get('statistics')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.STAFF
  )
  getStatistics(@Request() req) {
    return this.restaurantTablesService.getTableStatistics(req.user.companyId);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST,
    UserRole.STAFF
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  clearTable(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.clearTable(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/reserve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  reserveTable(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.reserveTable(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Post(':id/unreserve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @HttpCode(HttpStatus.OK)
  unreserveTable(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.unreserveTable(
      id,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.restaurantTablesService.remove(
      id,
      req.user.companyId,
      req.user.userId
    );
  }
}
