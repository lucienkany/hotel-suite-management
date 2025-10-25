import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryType } from '../common/constants';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    companyId: number,
    userId: number
  ) {
    // Check if category with same name already exists in this company
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        companyId,
        deletedAt: null,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAll(
    companyId: number,
    categoryType?: CategoryType,
    type?: string,
    search?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (categoryType) {
      where.categoryType = categoryType;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        products: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    companyId: number,
    userId: number
  ) {
    // Verify category exists and belongs to company
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // If updating name, check for duplicates
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          companyId,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: number, companyId: number, userId: number) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has active products
    if (category._count.products > 0) {
      throw new ConflictException(
        'Cannot delete category with active products'
      );
    }

    // Soft delete
    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getCategoryStatistics(id: number, companyId: number) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const [totalProducts, activeProducts, outOfStockProducts] =
      await Promise.all([
        this.prisma.product.count({
          where: {
            categoryId: id,
            deletedAt: null,
          },
        }),
        this.prisma.product.count({
          where: {
            categoryId: id,
            deletedAt: null,
            stock: { gt: 0 },
          },
        }),
        this.prisma.product.count({
          where: {
            categoryId: id,
            deletedAt: null,
            stock: { lte: 0 },
          },
        }),
      ]);

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
    };
  }
}
