import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantTableDto } from './dto/create-restaurant-table.dto';
import { UpdateRestaurantTableDto } from './dto/update-restaurant-table.dto';
import { AssignTableDto } from './dto/assign-table.dto';
import { TableStatus, OrderStatus } from '../common/constants';

@Injectable()
export class RestaurantTablesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRestaurantTableDto: CreateRestaurantTableDto,
    companyId: number,
    userId: number
  ) {
    // Check if table number already exists
    const existingTable = await this.prisma.restaurantTable.findFirst({
      where: {
        tableNumber: createRestaurantTableDto.tableNumber,
        companyId,
        deletedAt: null,
      },
    });

    if (existingTable) {
      throw new ConflictException('Table number already exists');
    }

    return this.prisma.restaurantTable.create({
      data: {
        ...createRestaurantTableDto,
        status: TableStatus.AVAILABLE,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAll(
    companyId: number,
    status?: TableStatus,
    minCapacity?: number,
    location?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (minCapacity) {
      where.capacity = {
        gte: minCapacity,
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    const [tables, total] = await Promise.all([
      this.prisma.restaurantTable.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          tableNumber: 'asc',
        },
        include: {
          currentOrder: {
            include: {
              client: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.restaurantTable.count({ where }),
    ]);

    return {
      data: tables,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        currentOrder: {
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
        },
      },
    });

    if (!table) {
      throw new NotFoundException('Restaurant table not found');
    }

    return table;
  }

  async update(
    id: number,
    updateRestaurantTableDto: UpdateRestaurantTableDto,
    companyId: number,
    userId: number
  ) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!table) {
      throw new NotFoundException('Restaurant table not found');
    }

    // If updating table number, check for conflicts
    if (
      updateRestaurantTableDto.tableNumber &&
      updateRestaurantTableDto.tableNumber !== table.tableNumber
    ) {
      const existingTable = await this.prisma.restaurantTable.findFirst({
        where: {
          tableNumber: updateRestaurantTableDto.tableNumber,
          companyId,
          deletedAt: null,
          NOT: {
            id,
          },
        },
      });

      if (existingTable) {
        throw new ConflictException('Table number already exists');
      }
    }

    // Don't allow manual status change if table is occupied
    if (
      updateRestaurantTableDto.status &&
      table.currentOrderId &&
      updateRestaurantTableDto.status === TableStatus.AVAILABLE
    ) {
      throw new BadRequestException(
        'Cannot mark table as available while it has an active order'
      );
    }

    return this.prisma.restaurantTable.update({
      where: { id },
      data: {
        ...updateRestaurantTableDto,
        updatedBy: userId,
      },
      include: {
        currentOrder: {
          include: {
            client: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async assignTable(
    id: number,
    assignTableDto: AssignTableDto,
    companyId: number,
    userId: number
  ) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!table) {
      throw new NotFoundException('Restaurant table not found');
    }

    if (
      table.status === TableStatus.RESERVED ||
      table.status === TableStatus.OCCUPIED
    ) {
      throw new BadRequestException('Table is not available');
    }

    // Verify order exists and is active
    const order = await this.prisma.restaurantOrder.findFirst({
      where: {
        id: assignTableDto.orderId,
        companyId,
        deletedAt: null,
        status: {
          notIn: [OrderStatus.CANCELLED, OrderStatus.COMPLETED],
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Active order not found');
    }

    // Check if order already has a table
    if (order.tableNumber) {
      const currentTable = await this.prisma.restaurantTable.findFirst({
        where: {
          tableNumber: order.tableNumber,
          companyId,
          deletedAt: null,
        },
      });

      if (currentTable) {
        throw new BadRequestException(
          'Order is already assigned to a table. Clear the current table first.'
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Update table status and assign order
      const updatedTable = await tx.restaurantTable.update({
        where: { id },
        data: {
          status: TableStatus.OCCUPIED,
          currentOrderId: assignTableDto.orderId,
          updatedBy: userId,
        },
        include: {
          currentOrder: {
            include: {
              client: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Update order with table number
      await tx.restaurantOrder.update({
        where: { id: assignTableDto.orderId },
        data: {
          tableNumber: table.tableNumber,
          updatedBy: userId,
        },
      });

      return updatedTable;
    });
  }

  async clearTable(id: number, companyId: number, userId: number) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        currentOrder: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Restaurant table not found');
    }

    if (!table.currentOrderId) {
      throw new BadRequestException('Table has no active order');
    }

    // Check if order is completed or cancelled
    if (
      table.currentOrder &&
      table.currentOrder.status !== OrderStatus.COMPLETED &&
      table.currentOrder.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot clear table with active order. Complete or cancel the order first.'
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Clear order's table number
      if (table.currentOrderId) {
        await tx.restaurantOrder.update({
          where: { id: table.currentOrderId },
          data: {
            tableNumber: null,
            updatedBy: userId,
          },
        });
      }

      // Clear table and set to available
      return tx.restaurantTable.update({
        where: { id },
        data: {
          status: TableStatus.AVAILABLE,
          currentOrderId: null,
          updatedBy: userId,
        },
      });
    });
  }

  async reserveTable(id: number, companyId: number, userId: number) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!table) {
      throw new NotFoundException('Restaurant table not found');
    }

    if (table.status !== TableStatus.AVAILABLE) {
      throw new BadRequestException('Table is not available for reservation');
    }

    return this.prisma.restaurantTable.update({
      where: { id },
      data: {
        status: TableStatus.RESERVED,
        updatedBy: userId,
      },
    });
  }

  async unreserveTable(id: number, companyId: number, userId: number) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!table) {
      throw new NotFoundException('Restaurant table not found');
    }

    if (table.status !== TableStatus.RESERVED) {
      throw new BadRequestException('Table is not reserved');
    }

    return this.prisma.restaurantTable.update({
      where: { id },
      data: {
        status: TableStatus.AVAILABLE,
        updatedBy: userId,
      },
    });
  }

  async remove(id: number, companyId: number, userId: number) {
    const table = await this.prisma.restaurantTable.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!table) {
      throw new NotFoundException('Restaurant table not found');
    }

    if (table.currentOrderId) {
      throw new BadRequestException('Cannot delete table with active order');
    }

    return this.prisma.restaurantTable.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getTableStatistics(companyId: number) {
    const [total, available, occupied, reserved] = await Promise.all([
      this.prisma.restaurantTable.count({
        where: {
          companyId,
          deletedAt: null,
        },
      }),
      this.prisma.restaurantTable.count({
        where: {
          companyId,
          deletedAt: null,
          status: TableStatus.AVAILABLE,
        },
      }),
      this.prisma.restaurantTable.count({
        where: {
          companyId,
          deletedAt: null,
          status: TableStatus.OCCUPIED,
        },
      }),
      this.prisma.restaurantTable.count({
        where: {
          companyId,
          deletedAt: null,
          status: TableStatus.RESERVED,
        },
      }),
    ]);

    return {
      total,
      available,
      occupied,
      reserved,
      occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(2) : '0.00',
    };
  }
}
