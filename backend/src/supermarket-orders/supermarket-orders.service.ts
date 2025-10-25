import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupermarketOrderDto } from './dto/create-supermarket-order.dto';
import { UpdateSupermarketOrderDto } from './dto/update-supermarket-order.dto';
import { AddItemsDto } from './dto/add-items.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import {
  OrderStatus,
  PaymentStatus,
  ServiceMode,
  CategoryType,
} from '../common/constants';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SupermarketOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSupermarketOrderDto: CreateSupermarketOrderDto,
    companyId: number,
    userId: number
  ) {
    // Verify client exists
    const client = await this.prisma.client.findFirst({
      where: {
        id: createSupermarketOrderDto.clientId,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Verify stay if provided
    if (createSupermarketOrderDto.stayId) {
      const stay = await this.prisma.stay.findFirst({
        where: {
          id: createSupermarketOrderDto.stayId,
          companyId,
          deletedAt: null,
        },
      });

      if (!stay) {
        throw new NotFoundException('Stay not found');
      }

      if (stay.clientId !== createSupermarketOrderDto.clientId) {
        throw new BadRequestException(
          'Stay does not belong to the specified client'
        );
      }
    }

    // Verify all products exist and belong to SUPERMARKET category
    const productIds = createSupermarketOrderDto.items.map(
      (item) => item.productId
    );
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        companyId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Check if all products are from SUPERMARKET category
    const nonSupermarketProducts = products.filter(
      (p) => p.category.categoryType !== CategoryType.SUPERMARKET
    );
    if (nonSupermarketProducts.length > 0) {
      throw new BadRequestException(
        'All products must be from SUPERMARKET category'
      );
    }

    // Calculate total
    let total = new Decimal(0);
    const orderItems = createSupermarketOrderDto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(
          `Product with id ${item.productId} not found`
        );
      }
      const itemTotal = product.price.mul(item.quantity);
      total = total.add(itemTotal);

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
      };
    });

    return this.prisma.supermarketOrder.create({
      data: {
        clientId: createSupermarketOrderDto.clientId,
        stayId: createSupermarketOrderDto.stayId,
        orderDate: createSupermarketOrderDto.orderDate
          ? new Date(createSupermarketOrderDto.orderDate)
          : new Date(),
        total,
        status: OrderStatus.PENDING,
        serviceMode:
          createSupermarketOrderDto.serviceMode || ServiceMode.WALK_IN,
        paymentStatus: PaymentStatus.PENDING,
        paidAmount: 0,
        companyId,
        createdBy: userId,
        updatedBy: userId,
        items: {
          create: orderItems,
        },
      },
      include: {
        client: true,
        stay: {
          include: {
            room: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(
    companyId: number,
    clientId?: number,
    stayId?: number,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
    serviceMode?: ServiceMode,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (clientId) {
      where.clientId = clientId;
    }

    if (stayId) {
      where.stayId = stayId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (serviceMode) {
      where.serviceMode = serviceMode;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.orderDate.lte = new Date(endDate);
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.supermarketOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          orderDate: 'desc',
        },
        include: {
          client: true,
          stay: {
            include: {
              room: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.supermarketOrder.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        client: true,
        stay: {
          include: {
            room: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    return order;
  }

  async update(
    id: number,
    updateSupermarketOrderDto: UpdateSupermarketOrderDto,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled order');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed order');
    }

    return this.prisma.supermarketOrder.update({
      where: { id },
      data: {
        ...updateSupermarketOrderDto,
        updatedBy: userId,
      },
      include: {
        client: true,
        stay: {
          include: {
            room: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async addItems(
    id: number,
    addItemsDto: AddItemsDto,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot add items to cancelled or completed order'
      );
    }

    // Verify products
    const productIds = addItemsDto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        companyId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const nonSupermarketProducts = products.filter(
      (p) => p.category.categoryType !== CategoryType.SUPERMARKET
    );
    if (nonSupermarketProducts.length > 0) {
      throw new BadRequestException(
        'All products must be from SUPERMARKET category'
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let newTotal = new Decimal(order.total);

      for (const item of addItemsDto.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new BadRequestException(
            `Product with id ${item.productId} not found`
          );
        }
        const itemTotal = product.price.mul(item.quantity);
        newTotal = newTotal.add(itemTotal);

        // Check if item already exists
        const existingItem = order.items.find(
          (i) => i.productId === item.productId
        );

        if (existingItem) {
          // Update existing item
          const newQuantity = new Decimal(existingItem.quantity).add(
            item.quantity
          );
          const newItemTotal = product.price.mul(newQuantity);

          await tx.supermarketOrderItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQuantity,
              total: newItemTotal,
            },
          });
        } else {
          // Create new item
          await tx.supermarketOrderItem.create({
            data: {
              orderId: id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
              total: itemTotal,
            },
          });
        }
      }

      return tx.supermarketOrder.update({
        where: { id },
        data: {
          total: newTotal,
          updatedBy: userId,
        },
        include: {
          client: true,
          stay: {
            include: {
              room: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async updateItem(
    orderId: number,
    itemId: number,
    updateItemDto: UpdateItemDto,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id: orderId,
        companyId,
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot update items in cancelled or completed order'
      );
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const oldItemTotal = new Decimal(item.total);
      const newItemTotal = item.product.price.mul(updateItemDto.quantity);
      const newOrderTotal = new Decimal(order.total)
        .sub(oldItemTotal)
        .add(newItemTotal);

      await tx.supermarketOrderItem.update({
        where: { id: itemId },
        data: {
          quantity: updateItemDto.quantity,
          total: newItemTotal,
        },
      });

      return tx.supermarketOrder.update({
        where: { id: orderId },
        data: {
          total: newOrderTotal,
          updatedBy: userId,
        },
        include: {
          client: true,
          stay: {
            include: {
              room: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async removeItem(
    orderId: number,
    itemId: number,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id: orderId,
        companyId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot remove items from cancelled or completed order'
      );
    }

    if (order.items.length === 1) {
      throw new BadRequestException(
        'Cannot remove the last item. Cancel the order instead.'
      );
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.supermarketOrderItem.delete({
        where: { id: itemId },
      });

      const newTotal = new Decimal(order.total).sub(item.total);

      return tx.supermarketOrder.update({
        where: { id: orderId },
        data: {
          total: newTotal,
          updatedBy: userId,
        },
        include: {
          client: true,
          stay: {
            include: {
              room: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });
    });
  }

  async cancel(id: number, companyId: number, userId: number) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed order');
    }

    return this.prisma.supermarketOrder.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        updatedBy: userId,
      },
      include: {
        client: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async complete(id: number, companyId: number, userId: number) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete cancelled order');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Order is already completed');
    }

    return this.prisma.supermarketOrder.update({
      where: { id },
      data: {
        status: OrderStatus.COMPLETED,
        updatedBy: userId,
      },
      include: {
        client: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: number, companyId: number, userId: number) {
    const order = await this.prisma.supermarketOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Supermarket order not found');
    }

    return this.prisma.supermarketOrder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getOrderStatistics(
    companyId: number,
    startDate?: string,
    endDate?: string
  ) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.orderDate.lte = new Date(endDate);
      }
    }

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.supermarketOrder.count({ where }),
      this.prisma.supermarketOrder.aggregate({
        where: {
          ...where,
          status: OrderStatus.COMPLETED,
        },
        _sum: {
          total: true,
        },
      }),
      this.prisma.supermarketOrder.count({
        where: {
          ...where,
          status: OrderStatus.PENDING,
        },
      }),
      this.prisma.supermarketOrder.count({
        where: {
          ...where,
          status: OrderStatus.COMPLETED,
        },
      }),
      this.prisma.supermarketOrder.count({
        where: {
          ...where,
          status: OrderStatus.CANCELLED,
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    };
  }
}
