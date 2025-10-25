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
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CategoryType } from '../common/constants';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'Product already exists' })
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(
      createProductDto,
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
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'categoryType', enum: CategoryType, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'inStock', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
    @Query('categoryType') categoryType?: CategoryType,
    @Query('search') search?: string,
    @Query('inStock', new ParseBoolPipe({ optional: true })) inStock?: boolean,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.productsService.findAll(
      req.user.companyId,
      categoryId,
      categoryType,
      search,
      inStock,
      page,
      limit
    );
  }

  @Get('low-stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Stock threshold (default: 10)',
  })
  getLowStockProducts(
    @Request() req,
    @Query('threshold', new ParseIntPipe({ optional: true })) threshold?: number
  ) {
    return this.productsService.getLowStockProducts(
      req.user.companyId,
      threshold
    );
  }

  @Get('out-of-stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get out of stock products' })
  getOutOfStockProducts(@Request() req) {
    return this.productsService.getOutOfStockProducts(req.user.companyId);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req
  ) {
    return this.productsService.update(
      id,
      updateProductDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Patch(':id/stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update product stock' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockDto: UpdateStockDto,
    @Request() req
  ) {
    return this.productsService.updateStock(
      id,
      updateStockDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.productsService.remove(id, req.user.companyId, req.user.userId);
  }
}
