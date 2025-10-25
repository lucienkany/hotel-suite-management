import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantOrderDto } from './dto/create-restaurant-order.dto';
import { UpdateRestaurantOrderDto } from './dto/update-restaurant-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { ServiceMode, OrderStatus, PaymentStatus } from '../common/constants';
import { Decimal } from '@prisma/client/runtime/library';

interface OrderItemData {
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Injectable()
export class RestaurantOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRestaurantOrderDto: CreateRestaurantOrderDto,
    companyId: number,
    userId: number
  ) {
    // Verify client exists
    const client = await this.prisma.client.findFirst({
      where: {
        id: createRestaurantOrderDto.clientId,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // If stayId provided, verify it exists and is active
    if (createRestaurantOrderDto.stayId) {
      const stay = await this.prisma.stay.findFirst({
        where: {
          id: createRestaurantOrderDto.stayId,
          companyId,
          deletedAt: null,
          status: { in: ['confirmed', 'checked_in'] },
        },
      });

      if (!stay) {
        throw new NotFoundException('Active stay not found');
      }

      // Verify stay belongs to the client
      if (stay.clientId !== createRestaurantOrderDto.clientId) {
        throw new BadRequestException('Stay does not belong to this client');
      }
    }

    // Verify all products exist and calculate total
    let total = new Decimal(0);
    const items: OrderItemData[] = [];

    for (const item of createRestaurantOrderDto.items) {
      const product = await this.prisma.product.findFirst({
        where: {
          id: item.productId,
          companyId,
          deletedAt: null,
          category: {
            categoryType: 'RESTAURANT',
            deletedAt: null,
          },
        },
        include: {
          category: true,
        },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found or not a restaurant product`
        );
      }

      // Check stock if needed
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}`
        );
      }

      const itemTotal = new Decimal(item.unitPrice).mul(
        new Decimal(item.quantity)
      );
      total = total.add(itemTotal);

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal.toNumber(),
      });
    }

    // Create order with items in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.restaurantOrder.create({
        data: {
          stayId: createRestaurantOrderDto.stayId,
          clientId: createRestaurantOrderDto.clientId,
          orderDate: new Date(),
          total: total.toNumber(),
          status: createRestaurantOrderDto.status,
          serviceMode: createRestaurantOrderDto.serviceMode,
          tableNumber: createRestaurantOrderDto.tableNumber,
          paymentStatus: PaymentStatus.PENDING,
          paidAmount: 0,
          companyId,
          createdBy: userId,
          updatedBy: userId,
        },
        include: {
          client: true,
          stay: {
            include: {
              room: true,
            },
          },
        },
      });

      // Create order items
      await tx.restaurantOrderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      });

      // Update product stock
      for (const item of createRestaurantOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Return order with items
      return tx.restaurantOrder.findUnique({
        where: { id: order.id },
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

  async findAll(
    companyId: number,
    stayId?: number,
    clientId?: number,
    status?: OrderStatus,
    serviceMode?: ServiceMode,
    paymentStatus?: PaymentStatus,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (stayId) {
      where.stayId = stayId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    if (serviceMode) {
      where.serviceMode = serviceMode;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = startDate;
      }
      if (endDate) {
        where.orderDate.lte = endDate;
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.restaurantOrder.findMany({
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
      this.prisma.restaurantOrder.count({ where }),
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
    const order = await this.prisma.restaurantOrder.findFirst({
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
        payments: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Restaurant order not found');
    }

    return order;
  }

  async update(
    id: number,
    updateRestaurantOrderDto: UpdateRestaurantOrderDto,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.restaurantOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Restaurant order not found');
    }

    // Don't allow status update if order is cancelled or completed
    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot update cancelled or completed orders'
      );
    }

    return this.prisma.restaurantOrder.update({
      where: { id },
      data: {
        ...updateRestaurantOrderDto,
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
    addOrderItemsDto: AddOrderItemsDto,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.restaurantOrder.findFirst({
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
      throw new NotFoundException('Restaurant order not found');
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot add items to cancelled or completed orders'
      );
    }

    // Verify products and calculate additional total
    let additionalTotal = new Decimal(0);
    const items: OrderItemData[] = [];

    for (const item of addOrderItemsDto.items) {
      const product = await this.prisma.product.findFirst({
        where: {
          id: item.productId,
          companyId,
          deletedAt: null,
          category: {
            categoryType: 'RESTAURANT',
            deletedAt: null,
          },
        },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}`
        );
      }

      const itemTotal = new Decimal(item.unitPrice).mul(
        new Decimal(item.quantity)
      );
      additionalTotal = additionalTotal.add(itemTotal);

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal.toNumber(),
      });
    }

    return this.prisma.$transaction(async (tx) => {
      // Add items
      await tx.restaurantOrderItem.createMany({
        data: items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      });

      // Update product stock
      for (const item of addOrderItemsDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update order total
      const newTotal = new Decimal(order.total).add(additionalTotal);
      const updatedOrder = await tx.restaurantOrder.update({
        where: { id },
        data: {
          total: newTotal.toNumber(),
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

      return updatedOrder;
    });
  }

  async removeItem(
    orderId: number,
    itemId: number,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.restaurantOrder.findFirst({
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
      throw new NotFoundException('Restaurant order not found');
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot remove items from cancelled or completed orders'
      );
    }

    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    // Don't allow removing the last item
    if (order.items.length === 1) {
      throw new BadRequestException(
        'Cannot remove the last item. Cancel the order instead.'
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete the item
      await tx.restaurantOrderItem.delete({
        where: { id: itemId },
      });

      // Restore product stock
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: Number(item.quantity),
          },
        },
      });

      // Update order total
      const newTotal = new Decimal(order.total).sub(new Decimal(item.total));
      return tx.restaurantOrder.update({
        where: { id: orderId },
        data: {
          total: newTotal.toNumber(),
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

  async payOrder(
    id: number,
    payOrderDto: PayOrderDto,
    companyId: number,
    userId: number
  ) {
    const order = await this.prisma.restaurantOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Restaurant order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for cancelled orders');
    }

    const currentPaid = new Decimal(order.paidAmount);
    const totalAmount = new Decimal(order.total);
    const paymentAmount = new Decimal(payOrderDto.amount);
    const newPaidAmount = currentPaid.add(paymentAmount);

    if (newPaidAmount.gt(totalAmount)) {
      throw new BadRequestException('Payment amount exceeds order total');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create payment record
      await tx.payment.create({
        data: {
          amount: payOrderDto.amount,
          paymentMethod: payOrderDto.paymentMethod,
          reference: payOrderDto.reference,
          notes: payOrderDto.notes,
          restaurantOrderId: id,
          companyId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      // Update order payment status
      const paymentStatus = newPaidAmount.equals(totalAmount)
        ? PaymentStatus.PAID
        : PaymentStatus.PARTIAL;

      return tx.restaurantOrder.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount.toNumber(),
          paymentStatus,
          status:
            paymentStatus === PaymentStatus.PAID
              ? OrderStatus.COMPLETED
              : order.status,
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
          payments: {
            where: {
              deletedAt: null,
            },
          },
        },
      });
    });
  }

  async cancel(id: number, companyId: number, userId: number) {
    const order = await this.prisma.restaurantOrder.findFirst({
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
      throw new NotFoundException('Restaurant order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed orders');
    }

    if (new Decimal(order.paidAmount).gt(0)) {
      throw new BadRequestException(
        'Cannot cancel orders with payments. Process refund first.'
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore product stock for all items
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: Number(item.quantity),
            },
          },
        });
      }

      // Update order status
      return tx.restaurantOrder.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
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

  async remove(id: number, companyId: number, userId: number) {
    const order = await this.prisma.restaurantOrder.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Restaurant order not found');
    }

    if (new Decimal(order.paidAmount).gt(0)) {
      throw new BadRequestException('Cannot delete orders with payments');
    }

    return this.prisma.restaurantOrder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getOrderStatistics(
    companyId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = startDate;
      }
      if (endDate) {
        where.orderDate.lte = endDate;
      }
    }

    const [totalOrders, totalRevenue, pendingOrders, completedOrders] =
      await Promise.all([
        this.prisma.restaurantOrder.count({ where }),
        this.prisma.restaurantOrder.aggregate({
          where,
          _sum: {
            total: true,
          },
        }),
        this.prisma.restaurantOrder.count({
          where: {
            ...where,
            status: OrderStatus.PENDING,
          },
        }),
        this.prisma.restaurantOrder.count({
          where: {
            ...where,
            status: OrderStatus.COMPLETED,
          },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      completedOrders,
    };
  }
}
