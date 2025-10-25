import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomStatus } from '../common/constants';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRoomDto: CreateRoomDto,
    companyId: number,
    userId: number
  ) {
    // Check if room number already exists for this company
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        companyId,
        roomNumber: createRoomDto.roomNumber,
        deletedAt: null,
      },
    });

    if (existingRoom) {
      throw new ConflictException(
        `Room number ${createRoomDto.roomNumber} already exists`
      );
    }

    // Verify room type exists and belongs to the company
    const roomType = await this.prisma.roomType.findFirst({
      where: {
        id: createRoomDto.roomTypeId,
        companyId,
        deletedAt: null,
      },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    return this.prisma.room.create({
      data: {
        ...createRoomDto,
        status: createRoomDto.status || RoomStatus.AVAILABLE,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        roomType: true,
      },
    });
  }

  async findAll(
    companyId: number,
    status?: RoomStatus,
    roomTypeId?: number,
    floor?: number
  ) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    if (floor !== undefined) {
      where.floor = floor;
    }

    return this.prisma.room.findMany({
      where,
      include: {
        roomType: true,
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });
  }

  async findOne(id: number, companyId: number) {
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        roomType: true,
        stays: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            checkInDate: 'desc',
          },
          take: 5,
          include: {
            client: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(
    id: number,
    updateRoomDto: UpdateRoomDto,
    companyId: number,
    userId: number
  ) {
    // Verify room exists and belongs to company
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check for room number conflict if updating room number
    if (
      updateRoomDto.roomNumber &&
      updateRoomDto.roomNumber !== room.roomNumber
    ) {
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          companyId,
          roomNumber: updateRoomDto.roomNumber,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (existingRoom) {
        throw new ConflictException(
          `Room number ${updateRoomDto.roomNumber} already exists`
        );
      }
    }

    // Verify room type exists if updating
    if (updateRoomDto.roomTypeId) {
      const roomType = await this.prisma.roomType.findFirst({
        where: {
          id: updateRoomDto.roomTypeId,
          companyId,
          deletedAt: null,
        },
      });

      if (!roomType) {
        throw new NotFoundException('Room type not found');
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        ...updateRoomDto,
        updatedBy: userId,
      },
      include: {
        roomType: true,
      },
    });
  }

  async remove(id: number, companyId: number, userId: number) {
    // Verify room exists and belongs to company
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if room has active stays
    const activeStay = await this.prisma.stay.findFirst({
      where: {
        roomId: id,
        status: {
          in: ['confirmed', 'checked_in'],
        },
        deletedAt: null,
      },
    });

    if (activeStay) {
      throw new ForbiddenException('Cannot delete room with active stays');
    }

    // Soft delete
    return this.prisma.room.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  async getAvailableRooms(
    companyId: number,
    checkIn: Date,
    checkOut: Date,
    roomTypeId?: number
  ) {
    const where: any = {
      companyId,
      status: RoomStatus.AVAILABLE,
      deletedAt: null,
    };

    if (roomTypeId) {
      where.roomTypeId = roomTypeId;
    }

    // Get all rooms matching criteria
    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        roomType: true,
        stays: {
          where: {
            deletedAt: null,
            OR: [
              {
                checkInDate: { lte: checkOut },
                checkOutDate: { gte: checkIn },
              },
            ],
          },
        },
      },
    });

    // Filter out rooms with conflicting stays
    return rooms.filter((room) => room.stays.length === 0);
  }

  async updateStatus(
    id: number,
    status: RoomStatus,
    companyId: number,
    userId: number
  ) {
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        status,
        updatedBy: userId,
      },
      include: {
        roomType: true,
      },
    });
  }
}
