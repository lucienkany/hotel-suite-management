import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { CategoryType } from '../common/constants';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
    companyId: number,
    userId: number
  ) {
    // Verify category exists and belongs to company
    const category = await this.prisma.category.findFirst({
      where: {
        id: createProductDto.categoryId,
        companyId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if product with same name exists in this category
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: createProductDto.name,
        categoryId: createProductDto.categoryId,
        companyId,
        deletedAt: null,
      },
    });

    if (existingProduct) {
      throw new ConflictException(
        'Product with this name already exists in this category'
      );
    }

    // Check if barcode is unique if provided
    if (createProductDto.barcode) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: {
          barcode: createProductDto.barcode,
          companyId,
          deletedAt: null,
        },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        stock: createProductDto.stock || 0,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(
    companyId: number,
    categoryId?: number,
    categoryType?: CategoryType,
    search?: string,
    inStock?: boolean,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categoryType) {
      where.category = {
        categoryType,
        deletedAt: null,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    if (inStock !== undefined) {
      where.stock = inStock ? { gt: 0 } : { lte: 0 };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
        include: {
          category: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    companyId: number,
    userId: number
  ) {
    // Verify product exists and belongs to company
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If updating category, verify it exists
    if (
      updateProductDto.categoryId &&
      updateProductDto.categoryId !== product.categoryId
    ) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateProductDto.categoryId,
          companyId,
          deletedAt: null,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // If updating name, check for duplicates
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          name: updateProductDto.name,
          categoryId: updateProductDto.categoryId || product.categoryId,
          companyId,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingProduct) {
        throw new ConflictException(
          'Product with this name already exists in this category'
        );
      }
    }

    // If updating barcode, check for duplicates
    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const existingBarcode = await this.prisma.product.findFirst({
        where: {
          barcode: updateProductDto.barcode,
          companyId,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        updatedBy: userId,
      },
      include: {
        category: true,
      },
    });
  }

  async updateStock(
    id: number,
    updateStockDto: UpdateStockDto,
    companyId: number,
    userId: number
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + updateStockDto.quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        updatedBy: userId,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: number, companyId: number, userId: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getLowStockProducts(companyId: number, threshold: number = 10) {
    return this.prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        stock: {
          lte: threshold,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });
  }

  async getOutOfStockProducts(companyId: number) {
    return this.prisma.product.findMany({
      where: {
        companyId,
        deletedAt: null,
        stock: 0,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
