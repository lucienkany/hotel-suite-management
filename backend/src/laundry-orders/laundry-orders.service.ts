import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLaundryOrderDto } from './dto/create-laundry-order.dto';
import { UpdateLaundryOrderDto } from './dto/update-laundry-order.dto';
import { AddItemsDto } from './dto/add-items.dto';
import { UpdateItemDto } from './dto/update-items.dto';
import {
  OrderStatus,
  PaymentStatus,
  ServiceMode,
  CategoryType,
} from '../common/constants';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LaundryOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createLaundryOrderDto: CreateLaundryOrderDto,
    companyId: number,
    userId: number
  ) {
    // Verify client exists
    const client = await this.prisma.client.findFirst({
      where: {
        id: createLaundryOrderDto.clientId,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Verify stay if provided
    if (createLaundryOrderDto.stayId) {
      const stay = await this.prisma.stay.findFirst({
        where: {
          id: createLaundryOrderDto.stayId,
          companyId,
          deletedAt: null,
        },
      });

      if (!stay) {
        throw new NotFoundException('Stay not found');
      }

      if (stay.clientId !== createLaundryOrderDto.clientId) {
        throw new BadRequestException(
          'Stay does not belong to the specified client'
        );
      }
    }

    // Verify all products exist and belong to LAUNDRY category
    const productIds = createLaundryOrderDto.items.map(
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

    // Check if all products are from LAUNDRY category
    const nonLaundryProducts = products.filter(
      (p) => p.category.categoryType !== CategoryType.LAUNDRY
    );
    if (nonLaundryProducts.length > 0) {
      throw new BadRequestException(
        'All products must be from LAUNDRY category'
      );
    }

    // Calculate total
    let total = new Decimal(0);
    const orderItems = createLaundryOrderDto.items.map((item) => {
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

    return this.prisma.laundryOrder.create({
      data: {
        clientId: createLaundryOrderDto.clientId,
        stayId: createLaundryOrderDto.stayId,
        orderDate: createLaundryOrderDto.orderDate
          ? new Date(createLaundryOrderDto.orderDate)
          : new Date(),
        pickupDate: createLaundryOrderDto.pickupDate
          ? new Date(createLaundryOrderDto.pickupDate)
          : null,
        deliveryDate: createLaundryOrderDto.deliveryDate
          ? new Date(createLaundryOrderDto.deliveryDate)
          : null,
        total,
        status: OrderStatus.PENDING,
        serviceMode: createLaundryOrderDto.serviceMode || ServiceMode.WALK_IN,
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
      this.prisma.laundryOrder.findMany({
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
      this.prisma.laundryOrder.count({ where }),
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
    const order = await this.prisma.laundryOrder.findFirst({
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
      throw new NotFoundException('Laundry order not found');
    }

    return order;
  }

  async update(
    id: number,
    updateLaundryOrderDto: UpdateLaundryOrderDto,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.laundryOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Laundry order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled order');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed order');
    }

    const updateData: any = {
      ...updateLaundryOrderDto,
      updatedBy: userId,
    };

    // Convert date strings to Date objects
    if (updateLaundryOrderDto.pickupDate) {
      updateData.pickupDate = new Date(updateLaundryOrderDto.pickupDate);
    }
    if (updateLaundryOrderDto.deliveryDate) {
      updateData.deliveryDate = new Date(updateLaundryOrderDto.deliveryDate);
    }

    return this.prisma.laundryOrder.update({
      where: { id },
      data: updateData,
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
    const order = await this.prisma.laundryOrder.findFirst({
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
      throw new NotFoundException('Laundry order not found');
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

    const nonLaundryProducts = products.filter(
      (p) => p.category.categoryType !== CategoryType.LAUNDRY
    );
    if (nonLaundryProducts.length > 0) {
      throw new BadRequestException(
        'All products must be from LAUNDRY category'
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

          await tx.laundryOrderItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQuantity,
              total: newItemTotal,
            },
          });
        } else {
          // Create new item
          await tx.laundryOrderItem.create({
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

      return tx.laundryOrder.update({
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
    const order = await this.prisma.laundryOrder.findFirst({
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
      throw new NotFoundException('Laundry order not found');
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

      await tx.laundryOrderItem.update({
        where: { id: itemId },
        data: {
          quantity: updateItemDto.quantity,
          total: newItemTotal,
        },
      });

      return tx.laundryOrder.update({
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
    const order = await this.prisma.laundryOrder.findFirst({
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
      throw new NotFoundException('Laundry order not found');
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
      await tx.laundryOrderItem.delete({
        where: { id: itemId },
      });

      const newTotal = new Decimal(order.total).sub(item.total);

      return tx.laundryOrder.update({
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
    const order = await this.prisma.laundryOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Laundry order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed order');
    }

    return this.prisma.laundryOrder.update({
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
    const order = await this.prisma.laundryOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Laundry order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete cancelled order');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Order is already completed');
    }

    return this.prisma.laundryOrder.update({
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
    const order = await this.prisma.laundryOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Laundry order not found');
    }

    return this.prisma.laundryOrder.update({
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
      this.prisma.laundryOrder.count({ where }),
      this.prisma.laundryOrder.aggregate({
        where: {
          ...where,
          status: OrderStatus.COMPLETED,
        },
        _sum: {
          total: true,
        },
      }),
      this.prisma.laundryOrder.count({
        where: {
          ...where,
          status: OrderStatus.PENDING,
        },
      }),
      this.prisma.laundryOrder.count({
        where: {
          ...where,
          status: OrderStatus.COMPLETED,
        },
      }),
      this.prisma.laundryOrder.count({
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
