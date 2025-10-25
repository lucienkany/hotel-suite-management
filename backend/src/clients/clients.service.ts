import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CustomerType } from '../common/constants';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createClientDto: CreateClientDto,
    companyId: number,
    userId: number
  ) {
    // Check if client with same email already exists (if email is provided)
    if (createClientDto.email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          companyId,
          email: createClientDto.email,
          deletedAt: null,
        },
      });

      if (existingClient) {
        throw new ConflictException(
          `Client with email ${createClientDto.email} already exists`
        );
      }
    }

    // Check if client with same phone already exists (if phone is provided)
    if (createClientDto.phone) {
      const existingClientByPhone = await this.prisma.client.findFirst({
        where: {
          companyId,
          phone: createClientDto.phone,
          deletedAt: null,
        },
      });

      if (existingClientByPhone) {
        throw new ConflictException(
          `Client with phone ${createClientDto.phone} already exists`
        );
      }
    }

    return this.prisma.client.create({
      data: {
        ...createClientDto,
        customerType: createClientDto.customerType || CustomerType.WALK_IN,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAll(
    companyId: number,
    customerType?: CustomerType,
    search?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (customerType) {
      where.customerType = customerType;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { idNumber: { contains: search } },
        { employeeId: { contains: search } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          sponsorCompany: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              stays: {
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
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        sponsorCompany: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        stays: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            checkInDate: 'desc',
          },
          take: 10,
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
        restaurantOrders: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 10,
        },
        supermarketOrders: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 10,
        },
        laundryOrders: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 10,
        },
        sportReservations: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            reservationDate: 'desc',
          },
          take: 10,
        },
        barberAppointments: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            appointmentDate: 'desc',
          },
          take: 10,
        },
        accountTransactions: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            transactionDate: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            stays: {
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
            invoices: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(
    id: number,
    updateClientDto: UpdateClientDto,
    companyId: number,
    userId: number
  ) {
    // Verify client exists and belongs to company
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check for email conflict if updating email
    if (updateClientDto.email && updateClientDto.email !== client.email) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          companyId,
          email: updateClientDto.email,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingClient) {
        throw new ConflictException(
          `Client with email ${updateClientDto.email} already exists`
        );
      }
    }

    // Check for phone conflict if updating phone
    if (updateClientDto.phone && updateClientDto.phone !== client.phone) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          companyId,
          phone: updateClientDto.phone,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingClient) {
        throw new ConflictException(
          `Client with phone ${updateClientDto.phone} already exists`
        );
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...updateClientDto,
        updatedBy: userId,
      },
    });
  }

  async remove(id: number, companyId: number, userId: number) {
    // Verify client exists and belongs to company
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Soft delete
    return this.prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getClientStatistics(id: number, companyId: number) {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const [
      totalStays,
      totalRestaurantOrders,
      totalSupermarketOrders,
      totalLaundryOrders,
      totalSportReservations,
      totalBarberAppointments,
      totalInvoices,
    ] = await Promise.all([
      this.prisma.stay.count({
        where: {
          clientId: id,
          deletedAt: null,
        },
      }),
      this.prisma.restaurantOrder.count({
        where: {
          clientId: id,
          deletedAt: null,
        },
      }),
      this.prisma.supermarketOrder.count({
        where: {
          clientId: id,
          deletedAt: null,
        },
      }),
      this.prisma.laundryOrder.count({
        where: {
          clientId: id,
          deletedAt: null,
        },
      }),
      this.prisma.sportReservation.count({
        where: {
          clientId: id,
          deletedAt: null,
        },
      }),
      this.prisma.barberAppointment.count({
        where: {
          clientId: id,
          deletedAt: null,
        },
      }),
      this.prisma.invoice.count({
        where: {
          clientId: id,
          deletedAt: null,
        },
      }),
    ]);

    const lastStay = await this.prisma.stay.findFirst({
      where: {
        clientId: id,
        deletedAt: null,
      },
      orderBy: {
        checkInDate: 'desc',
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
      },
    });

    return {
      totalStays,
      totalRestaurantOrders,
      totalSupermarketOrders,
      totalLaundryOrders,
      totalSportReservations,
      totalBarberAppointments,
      totalInvoices,
      totalOrders:
        totalRestaurantOrders +
        totalSupermarketOrders +
        totalLaundryOrders +
        totalSportReservations +
        totalBarberAppointments,
      currentBalance: client.currentBalance,
      creditLimit: client.creditLimit,
      hasAccount: client.hasAccount,
      lastStay,
    };
  }

  async getClientBalance(id: number, companyId: number) {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        currentBalance: true,
        creditLimit: true,
        hasAccount: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async searchByPhoneOrEmail(companyId: number, query: string) {
    return this.prisma.client.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [
          { phone: { contains: query } },
          { email: { contains: query } },
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { idNumber: { contains: query } },
          { employeeId: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        customerType: true,
        hasAccount: true,
        currentBalance: true,
      },
    });
  }

  async getCorporateClients(companyId: number, sponsorCompanyId?: number) {
    const where: any = {
      companyId,
      deletedAt: null,
      customerType: CustomerType.CORPORATE,
    };

    if (sponsorCompanyId) {
      where.sponsorCompanyId = sponsorCompanyId;
    }

    return this.prisma.client.findMany({
      where,
      include: {
        sponsorCompany: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
