// sport-reservations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSportReservationDto } from './dto/create-sport-reservation.dto';
import { UpdateSportReservationDto } from './dto/update-sport-reservation.dto';
import { Decimal } from '@prisma/client/runtime/library';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export enum ServiceMode {
  WALK_IN = 'WALK_IN',
  HOTEL_GUEST = 'HOTEL_GUEST',
}

@Injectable()
export class SportReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createSportReservationDto: CreateSportReservationDto,
    companyId: number,
    userId: number
  ) {
    const {
      clientId,
      stayId,
      facilityId,
      startTime,
      endTime,
      quantity,
      notes,
    } = createSportReservationDto;

    // Verify client belongs to company
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, companyId, deletedAt: null },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Determine service mode
    let serviceMode = ServiceMode.WALK_IN;

    // Verify stay if provided
    if (stayId) {
      const stay = await this.prisma.stay.findFirst({
        where: {
          id: stayId,
          clientId,
          companyId,
          deletedAt: null,
        },
      });

      if (!stay) {
        throw new NotFoundException('Stay not found');
      }

      serviceMode = ServiceMode.HOTEL_GUEST;
    }

    // Verify facility (product) belongs to company
    const facility = await this.prisma.product.findFirst({
      where: {
        id: facilityId,
        companyId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!facility) {
      throw new NotFoundException('Sport facility not found');
    }

    // Validate time slot
    const start = new Date(startTime);
    const end = new Date(endTime);
    const reservationDate = new Date(start);
    reservationDate.setHours(0, 0, 0, 0);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    if (start < new Date()) {
      throw new BadRequestException('Cannot create reservation in the past');
    }

    // Check for conflicts/overlapping reservations
    const conflicts = await this.prisma.sportReservation.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: {
          notIn: [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED],
        },
        items: {
          some: {
            productId: facilityId,
          },
        },
        OR: [
          {
            AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
          },
          {
            AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
          },
          {
            AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
          },
        ],
      },
      include: {
        items: {
          where: {
            productId: facilityId,
          },
        },
      },
    });

    // Check capacity - assuming capacity is stored somewhere (adjust as needed)
    const capacity = 999; // Default capacity, adjust based on your schema

    const totalBooked = conflicts.reduce((sum, reservation) => {
      const facilityItems = reservation.items.filter(
        (item) => item.productId === facilityId
      );
      return (
        sum +
        facilityItems.reduce(
          (itemSum, item) => itemSum + Number(item.quantity),
          0
        )
      );
    }, 0);

    if (totalBooked + quantity > capacity) {
      throw new ConflictException(
        `Insufficient capacity. Available: ${capacity - totalBooked}, Requested: ${quantity}`
      );
    }

    // Calculate total amount
    const unitPrice = Number(facility.price);
    const total = new Decimal(unitPrice * quantity);

    // Create reservation with item
    const reservation = await this.prisma.sportReservation.create({
      data: {
        companyId,
        clientId,
        stayId,
        reservationDate,
        startTime: start,
        endTime: end,
        total,
        status: ReservationStatus.PENDING,
        serviceMode,
        facilityType: facility.category?.name || null,
        paymentStatus: PaymentStatus.PENDING,
        paidAmount: new Decimal(0),
        createdBy: userId,
        updatedBy: userId,
        items: {
          create: {
            productId: facilityId,
            quantity: new Decimal(quantity),
            unitPrice: new Decimal(unitPrice),
            total,
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        stay: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            room: {
              select: {
                id: true,
                name: true,
                roomNumber: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                unit: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return reservation;
  }

  async findAll(
    companyId: number,
    clientId?: number,
    stayId?: number,
    facilityId?: number,
    status?: string,
    paymentStatus?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50
  ) {
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

    if (facilityId) {
      where.items = {
        some: {
          productId: facilityId,
        },
      };
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.reservationDate = {};
      if (startDate) {
        where.reservationDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.reservationDate.lte = new Date(endDate);
      }
    }

    const [reservations, total] = await Promise.all([
      this.prisma.sportReservation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          stay: {
            select: {
              id: true,
              checkInDate: true,
              checkOutDate: true,
              room: {
                select: {
                  id: true,
                  name: true,
                  roomNumber: true,
                },
              },
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  unit: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.sportReservation.count({ where }),
    ]);

    return {
      data: reservations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const reservation = await this.prisma.sportReservation.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            idNumber: true,
          },
        },
        stay: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            room: {
              select: {
                id: true,
                name: true,
                roomNumber: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                unit: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        updater: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Sport reservation not found');
    }

    return reservation;
  }

  async update(
    id: number,
    updateSportReservationDto: UpdateSportReservationDto,
    companyId: number,
    userId: number
  ) {
    const reservation = await this.findOne(id, companyId);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled reservation');
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed reservation');
    }

    const {
      startTime,
      endTime,
      quantity,
      status,
      paymentStatus,
      notes,
      facilityId,
    } = updateSportReservationDto;

    let updateData: any = {
      updatedBy: userId,
      updatedAt: new Date(),
    };

    // If changing time or quantity, recalculate
    if (startTime || endTime || quantity !== undefined || facilityId) {
      const start = startTime ? new Date(startTime) : reservation.startTime;
      const end = endTime ? new Date(endTime) : reservation.endTime;
      const newQuantity =
        quantity ?? Number(reservation.items[0]?.quantity ?? 1);
      const newFacilityId = facilityId ?? reservation.items[0]?.productId;

      if (start >= end) {
        throw new BadRequestException('End time must be after start time');
      }

      // Get facility details
      const facility = await this.prisma.product.findFirst({
        where: {
          id: newFacilityId,
          companyId,
          deletedAt: null,
        },
        include: {
          category: true,
        },
      });

      if (!facility) {
        throw new NotFoundException('Sport facility not found');
      }

      // Check capacity
      const capacity = 999; // Adjust based on your schema

      // Check for conflicts (excluding current reservation)
      const conflicts = await this.prisma.sportReservation.findMany({
        where: {
          companyId,
          id: { not: id },
          deletedAt: null,
          status: {
            notIn: [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED],
          },
          items: {
            some: {
              productId: newFacilityId,
            },
          },
          OR: [
            {
              AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
            },
            {
              AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
            },
            {
              AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
            },
          ],
        },
        include: {
          items: {
            where: {
              productId: newFacilityId,
            },
          },
        },
      });

      const totalBooked = conflicts.reduce((sum, res) => {
        const facilityItems = res.items.filter(
          (item) => item.productId === newFacilityId
        );
        return (
          sum +
          facilityItems.reduce(
            (itemSum, item) => itemSum + Number(item.quantity),
            0
          )
        );
      }, 0);

      if (totalBooked + newQuantity > capacity) {
        throw new ConflictException(
          `Insufficient capacity. Available: ${capacity - totalBooked}, Requested: ${newQuantity}`
        );
      }

      const unitPrice = Number(facility.price);
      const total = new Decimal(unitPrice * newQuantity);

      updateData = {
        ...updateData,
        startTime: start,
        endTime: end,
        total,
        reservationDate: new Date(start.setHours(0, 0, 0, 0)),
        facilityType: facility.category?.name || null,
      };

      // Delete existing items and create new ones
      await this.prisma.sportReservationItem.deleteMany({
        where: { reservationId: id },
      });

      updateData.items = {
        create: {
          productId: newFacilityId,
          quantity: new Decimal(newQuantity),
          unitPrice: new Decimal(unitPrice),
          total,
        },
      };
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await this.prisma.sportReservation.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        stay: {
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            room: {
              select: {
                id: true,
                name: true,
                roomNumber: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                unit: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async cancel(id: number, companyId: number, userId: number) {
    const reservation = await this.findOne(id, companyId);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation is already cancelled');
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed reservation');
    }

    const updated = await this.prisma.sportReservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async confirm(id: number, companyId: number, userId: number) {
    const reservation = await this.findOne(id, companyId);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Cannot confirm cancelled reservation');
    }

    if (reservation.status === ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Reservation is already confirmed');
    }

    const updated = await this.prisma.sportReservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async complete(id: number, companyId: number, userId: number) {
    const reservation = await this.findOne(id, companyId);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Cannot complete cancelled reservation');
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('Reservation is already completed');
    }

    const updated = await this.prisma.sportReservation.update({
      where: { id },
      data: {
        status: ReservationStatus.COMPLETED,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  async getAvailability(companyId: number, facilityId: number, date: string) {
    // Verify facility
    const facility = await this.prisma.product.findFirst({
      where: {
        id: facilityId,
        companyId,
        deletedAt: null,
      },
    });

    if (!facility) {
      throw new NotFoundException('Sport facility not found');
    }

    const capacity = 999; // Adjust based on your schema
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all reservations for the day
    const reservations = await this.prisma.sportReservation.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: {
          notIn: [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED],
        },
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        items: {
          some: {
            productId: facilityId,
          },
        },
      },
      include: {
        items: {
          where: {
            productId: facilityId,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return {
      facility: {
        id: facility.id,
        name: facility.name,
        capacity,
      },
      date,
      reservations: reservations.map((r) => ({
        id: r.id,
        startTime: r.startTime,
        endTime: r.endTime,
        quantity: Number(r.items[0]?.quantity || 0),
        status: r.status,
      })),
      totalCapacity: capacity,
    };
  }

  async getReservationStatistics(
    companyId: number,
    startDate?: string,
    endDate?: string
  ) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.reservationDate = {};
      if (startDate) {
        where.reservationDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.reservationDate.lte = new Date(endDate);
      }
    }

    const [
      totalReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations,
      totalRevenue,
      paidRevenue,
    ] = await Promise.all([
      this.prisma.sportReservation.count({ where }),
      this.prisma.sportReservation.count({
        where: { ...where, status: ReservationStatus.CONFIRMED },
      }),
      this.prisma.sportReservation.count({
        where: { ...where, status: ReservationStatus.COMPLETED },
      }),
      this.prisma.sportReservation.count({
        where: { ...where, status: ReservationStatus.CANCELLED },
      }),
      this.prisma.sportReservation.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.sportReservation.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        _sum: { paidAmount: true },
      }),
    ]);

    const totalRev = Number(totalRevenue._sum.total || 0);
    const paidRev = Number(paidRevenue._sum.paidAmount || 0);

    return {
      totalReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations,
      totalRevenue: totalRev,
      paidRevenue: paidRev,
      pendingRevenue: totalRev - paidRev,
    };
  }

  async remove(id: number, companyId: number, userId: number) {
    await this.findOne(id, companyId);

    await this.prisma.sportReservation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return { message: 'Sport reservation deleted successfully' };
  }
}
