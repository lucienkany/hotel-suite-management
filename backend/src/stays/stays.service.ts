import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStayDto } from './dto/create-stay.dto';
import { UpdateStayDto } from './dto/update-stay.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { StayStatus, RoomStatus } from '../common/constants';

@Injectable()
export class StaysService {
  constructor(private prisma: PrismaService) {}

  async create(
    createStayDto: CreateStayDto,
    companyId: number,
    userId: number
  ) {
    // Verify room exists and belongs to company
    const room = await this.prisma.room.findFirst({
      where: {
        id: createStayDto.roomId,
        companyId,
        deletedAt: null,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Verify client exists and belongs to company
    const client = await this.prisma.client.findFirst({
      where: {
        id: createStayDto.clientId,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check date validity
    const checkInDate = new Date(createStayDto.checkInDate);
    const checkOutDate = new Date(createStayDto.checkOutDate);

    if (checkOutDate <= checkInDate) {
      throw new BadRequestException(
        'Check-out date must be after check-in date'
      );
    }

    // Check for overlapping bookings
    const overlappingStay = await this.prisma.stay.findFirst({
      where: {
        roomId: createStayDto.roomId,
        deletedAt: null,
        status: {
          in: [StayStatus.CONFIRMED, StayStatus.CHECKED_IN],
        },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gte: checkOutDate } },
            ],
          },
          {
            AND: [
              { checkInDate: { gte: checkInDate } },
              { checkOutDate: { lte: checkOutDate } },
            ],
          },
        ],
      },
    });

    if (overlappingStay) {
      throw new ConflictException(
        'Room is already booked for the selected dates'
      );
    }

    // Create the stay
    const stay = await this.prisma.stay.create({
      data: {
        ...createStayDto,
        checkInDate,
        checkOutDate,
        status: createStayDto.status || StayStatus.CONFIRMED,
        adults: createStayDto.adults || 1,
        children: createStayDto.children || 0,
        paidAmount: createStayDto.paidAmount || 0,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
    });

    // Update room status to RESERVED
    await this.prisma.room.update({
      where: { id: createStayDto.roomId },
      data: { status: RoomStatus.RESERVED },
    });

    return stay;
  }

  async findAll(
    companyId: number,
    status?: StayStatus,
    roomId?: number,
    clientId?: number,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate && endDate) {
      where.AND = [
        { checkInDate: { gte: new Date(startDate) } },
        { checkOutDate: { lte: new Date(endDate) } },
      ];
    } else if (startDate) {
      where.checkInDate = { gte: new Date(startDate) };
    } else if (endDate) {
      where.checkOutDate = { lte: new Date(endDate) };
    }

    const [stays, total] = await Promise.all([
      this.prisma.stay.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          checkInDate: 'desc',
        },
        include: {
          room: {
            include: {
              roomType: true,
            },
          },
          client: true,
          _count: {
            select: {
              consumptions: {
                where: {
                  deletedAt: null,
                },
              },
              restaurantOrders: {
                where: {
                  deletedAt: null,
                },
              },
              supermarketOrders: {
                where: {
                  deletedAt: null,
                },
              },
              laundryOrders: {
                where: {
                  deletedAt: null,
                },
              },
              sportReservations: {
                where: {
                  deletedAt: null,
                },
              },
              barberAppointments: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      }),
      this.prisma.stay.count({ where }),
    ]);

    return {
      data: stays,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const stay = await this.prisma.stay.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
        consumptions: {
          where: {
            deletedAt: null,
          },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
        },
        restaurantOrders: {
          where: {
            deletedAt: null,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            orderDate: 'desc',
          },
        },
        supermarketOrders: {
          where: {
            deletedAt: null,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            orderDate: 'desc',
          },
        },
        laundryOrders: {
          where: {
            deletedAt: null,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            orderDate: 'desc',
          },
        },
        sportReservations: {
          where: {
            deletedAt: null,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            reservationDate: 'desc',
          },
        },
        barberAppointments: {
          where: {
            deletedAt: null,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            appointmentDate: 'desc',
          },
        },
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    return stay;
  }

  async update(
    id: number,
    updateStayDto: UpdateStayDto,
    companyId: number,
    userId: number
  ) {
    // Verify stay exists and belongs to company
    const stay = await this.prisma.stay.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    // If updating room, verify it exists
    if (updateStayDto.roomId && updateStayDto.roomId !== stay.roomId) {
      const room = await this.prisma.room.findFirst({
        where: {
          id: updateStayDto.roomId,
          companyId,
          deletedAt: null,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }
    }

    // If updating client, verify they exist
    if (updateStayDto.clientId && updateStayDto.clientId !== stay.clientId) {
      const client = await this.prisma.client.findFirst({
        where: {
          id: updateStayDto.clientId,
          companyId,
          deletedAt: null,
        },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    // Check date validity if updating dates
    if (updateStayDto.checkInDate || updateStayDto.checkOutDate) {
      const checkInDate = updateStayDto.checkInDate
        ? new Date(updateStayDto.checkInDate)
        : stay.checkInDate;
      const checkOutDate = updateStayDto.checkOutDate
        ? new Date(updateStayDto.checkOutDate)
        : stay.checkOutDate;

      if (checkOutDate <= checkInDate) {
        throw new BadRequestException(
          'Check-out date must be after check-in date'
        );
      }
    }

    const updateData: any = {
      ...updateStayDto,
      updatedBy: userId,
    };

    if (updateStayDto.checkInDate) {
      updateData.checkInDate = new Date(updateStayDto.checkInDate);
    }
    if (updateStayDto.checkOutDate) {
      updateData.checkOutDate = new Date(updateStayDto.checkOutDate);
    }
    if (updateStayDto.actualCheckIn) {
      updateData.actualCheckIn = new Date(updateStayDto.actualCheckIn);
    }
    if (updateStayDto.actualCheckOut) {
      updateData.actualCheckOut = new Date(updateStayDto.actualCheckOut);
    }

    return this.prisma.stay.update({
      where: { id },
      data: updateData,
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
    });
  }

  async checkIn(
    id: number,
    checkInDto: CheckInDto,
    companyId: number,
    userId: number
  ) {
    const stay = await this.prisma.stay.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    if (stay.status !== StayStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed stays can be checked in');
    }

    const actualCheckIn = checkInDto.actualCheckIn
      ? new Date(checkInDto.actualCheckIn)
      : new Date();

    const updatedStay = await this.prisma.stay.update({
      where: { id },
      data: {
        status: StayStatus.CHECKED_IN,
        actualCheckIn,
        updatedBy: userId,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
    });

    // Update room status to OCCUPIED
    await this.prisma.room.update({
      where: { id: stay.roomId },
      data: { status: RoomStatus.OCCUPIED },
    });

    return updatedStay;
  }

  async checkOut(
    id: number,
    checkOutDto: CheckOutDto,
    companyId: number,
    userId: number
  ) {
    const stay = await this.prisma.stay.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    if (stay.status !== StayStatus.CHECKED_IN) {
      throw new BadRequestException('Only checked-in stays can be checked out');
    }

    const actualCheckOut = checkOutDto.actualCheckOut
      ? new Date(checkOutDto.actualCheckOut)
      : new Date();

    const updatedStay = await this.prisma.stay.update({
      where: { id },
      data: {
        status: StayStatus.CHECKED_OUT,
        actualCheckOut,
        updatedBy: userId,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
    });

    // Update room status to AVAILABLE
    await this.prisma.room.update({
      where: { id: stay.roomId },
      data: { status: RoomStatus.AVAILABLE },
    });

    return updatedStay;
  }

  async cancel(id: number, companyId: number, userId: number) {
    const stay = await this.prisma.stay.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    if (stay.status === StayStatus.CHECKED_OUT) {
      throw new BadRequestException('Cannot cancel a checked-out stay');
    }

    if (stay.status === StayStatus.CANCELLED) {
      throw new BadRequestException('Stay is already cancelled');
    }

    const updatedStay = await this.prisma.stay.update({
      where: { id },
      data: {
        status: StayStatus.CANCELLED,
        updatedBy: userId,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
    });

    // Update room status to AVAILABLE
    await this.prisma.room.update({
      where: { id: stay.roomId },
      data: { status: RoomStatus.AVAILABLE },
    });

    return updatedStay;
  }

  async remove(id: number, companyId: number, userId: number) {
    const stay = await this.prisma.stay.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    // Soft delete
    return this.prisma.stay.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getActiveStays(companyId: number) {
    return this.prisma.stay.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: StayStatus.CHECKED_IN,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
      orderBy: {
        checkInDate: 'desc',
      },
    });
  }

  async getUpcomingStays(companyId: number, days: number = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.prisma.stay.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: StayStatus.CONFIRMED,
        checkInDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        client: true,
      },
      orderBy: {
        checkInDate: 'asc',
      },
    });
  }

  async getStayStatistics(id: number, companyId: number) {
    const stay = await this.prisma.stay.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!stay) {
      throw new NotFoundException('Stay not found');
    }

    const [
      totalConsumptions,
      totalRestaurantOrders,
      totalSupermarketOrders,
      totalLaundryOrders,
      totalSportReservations,
      totalBarberAppointments,
      consumptionsSum,
      restaurantOrdersSum,
      supermarketOrdersSum,
      laundryOrdersSum,
      sportReservationsSum,
      barberAppointmentsSum,
    ] = await Promise.all([
      this.prisma.consumption.count({
        where: { stayId: id, deletedAt: null },
      }),
      this.prisma.restaurantOrder.count({
        where: { stayId: id, deletedAt: null },
      }),
      this.prisma.supermarketOrder.count({
        where: { stayId: id, deletedAt: null },
      }),
      this.prisma.laundryOrder.count({
        where: { stayId: id, deletedAt: null },
      }),
      this.prisma.sportReservation.count({
        where: { stayId: id, deletedAt: null },
      }),
      this.prisma.barberAppointment.count({
        where: { stayId: id, deletedAt: null },
      }),
      this.prisma.consumption.aggregate({
        where: { stayId: id, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.restaurantOrder.aggregate({
        where: { stayId: id, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.supermarketOrder.aggregate({
        where: { stayId: id, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.laundryOrder.aggregate({
        where: { stayId: id, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.sportReservation.aggregate({
        where: { stayId: id, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.barberAppointment.aggregate({
        where: { stayId: id, deletedAt: null },
        _sum: { total: true },
      }),
    ]);

    const totalServicesSpent =
      (consumptionsSum._sum.total?.toNumber() || 0) +
      (restaurantOrdersSum._sum.total?.toNumber() || 0) +
      (supermarketOrdersSum._sum.total?.toNumber() || 0) +
      (laundryOrdersSum._sum.total?.toNumber() || 0) +
      (sportReservationsSum._sum.total?.toNumber() || 0) +
      (barberAppointmentsSum._sum.total?.toNumber() || 0);

    const grandTotal = stay.totalAmount.toNumber() + totalServicesSpent;

    return {
      roomCharge: stay.totalAmount,
      totalConsumptions,
      totalRestaurantOrders,
      totalSupermarketOrders,
      totalLaundryOrders,
      totalSportReservations,
      totalBarberAppointments,
      consumptionsAmount: consumptionsSum._sum.total || 0,
      restaurantOrdersAmount: restaurantOrdersSum._sum.total || 0,
      supermarketOrdersAmount: supermarketOrdersSum._sum.total || 0,
      laundryOrdersAmount: laundryOrdersSum._sum.total || 0,
      sportReservationsAmount: sportReservationsSum._sum.total || 0,
      barberAppointmentsAmount: barberAppointmentsSum._sum.total || 0,
      totalServicesSpent,
      grandTotal,
      paidAmount: stay.paidAmount,
      balance: grandTotal - stay.paidAmount.toNumber(),
    };
  }
}
