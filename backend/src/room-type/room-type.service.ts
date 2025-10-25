import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomTypeService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRoomTypeDto: CreateRoomTypeDto,
    companyId: number,
    userId: number
  ) {
    // Check if room type with same name exists in the company
    const existingRoomType = await this.prisma.roomType.findFirst({
      where: {
        companyId,
        name: createRoomTypeDto.name,
        deletedAt: null,
      },
    });

    if (existingRoomType) {
      throw new ConflictException('Room type with this name already exists');
    }

    return this.prisma.roomType.create({
      data: {
        companyId,
        createdBy: userId,
        updatedBy: userId,
        name: createRoomTypeDto.name,
        description: createRoomTypeDto.description,
        basePrice: createRoomTypeDto.basePrice,
        maxOccupancy: createRoomTypeDto.maxOccupancy,
        bedType: createRoomTypeDto.bedType,
        size: createRoomTypeDto.size,
        amenities: createRoomTypeDto.amenities
          ? JSON.stringify(createRoomTypeDto.amenities)
          : null,
        images: createRoomTypeDto.images
          ? JSON.stringify(createRoomTypeDto.images)
          : null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });
  }

  async findAll(
    companyId: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.RoomTypeWhereInput = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { bedType: { contains: search } },
        ],
      }),
    };

    const [roomTypes, total] = await Promise.all([
      this.prisma.roomType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              rooms: true,
            },
          },
        },
      }),
      this.prisma.roomType.count({ where }),
    ]);

    // Parse JSON strings back to arrays
    const parsedRoomTypes = roomTypes.map((roomType) => ({
      ...roomType,
      amenities: roomType.amenities ? JSON.parse(roomType.amenities) : [],
      images: roomType.images ? JSON.parse(roomType.images) : [],
    }));

    return {
      data: parsedRoomTypes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, companyId: number) {
    const roomType = await this.prisma.roomType.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        rooms: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            roomNumber: true,
            floor: true,
            status: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    // Parse JSON strings back to arrays
    return {
      ...roomType,
      amenities: roomType.amenities ? JSON.parse(roomType.amenities) : [],
      images: roomType.images ? JSON.parse(roomType.images) : [],
    };
  }

  async update(
    id: number,
    updateRoomTypeDto: UpdateRoomTypeDto,
    companyId: number,
    userId: number
  ) {
    const roomType = await this.prisma.roomType.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    // Check for name conflict if name is being updated
    if (updateRoomTypeDto.name && updateRoomTypeDto.name !== roomType.name) {
      const existingRoomType = await this.prisma.roomType.findFirst({
        where: {
          companyId,
          name: updateRoomTypeDto.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingRoomType) {
        throw new ConflictException('Room type with this name already exists');
      }
    }

    const updated = await this.prisma.roomType.update({
      where: { id },
      data: {
        updatedBy: userId,
        name: updateRoomTypeDto.name,
        description: updateRoomTypeDto.description,
        basePrice: updateRoomTypeDto.basePrice,
        maxOccupancy: updateRoomTypeDto.maxOccupancy,
        bedType: updateRoomTypeDto.bedType,
        size: updateRoomTypeDto.size,
        amenities: updateRoomTypeDto.amenities
          ? JSON.stringify(updateRoomTypeDto.amenities)
          : undefined,
        images: updateRoomTypeDto.images
          ? JSON.stringify(updateRoomTypeDto.images)
          : undefined,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    // Parse JSON strings back to arrays
    return {
      ...updated,
      amenities: updated.amenities ? JSON.parse(updated.amenities) : [],
      images: updated.images ? JSON.parse(updated.images) : [],
    };
  }

  async remove(id: number, companyId: number, userId: number) {
    const roomType = await this.prisma.roomType.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            rooms: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    // Check if there are active rooms using this room type
    if (roomType._count.rooms > 0) {
      throw new ForbiddenException(
        `Cannot delete room type. There are ${roomType._count.rooms} active room(s) using this type.`
      );
    }

    return this.prisma.roomType.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getStats(companyId: number) {
    const roomTypes = await this.prisma.roomType.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            rooms: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    const stats = {
      totalRoomTypes: roomTypes.length,
      totalRooms: roomTypes.reduce((sum, rt) => sum + rt._count.rooms, 0),
      avgRoomsPerType:
        roomTypes.length > 0
          ? roomTypes.reduce((sum, rt) => sum + rt._count.rooms, 0) /
            roomTypes.length
          : 0,
      roomTypeBreakdown: roomTypes.map((rt) => ({
        id: rt.id,
        name: rt.name,
        basePrice: rt.basePrice,
        maxOccupancy: rt.maxOccupancy,
        totalRooms: rt._count.rooms,
      })),
    };

    return stats;
  }
}
