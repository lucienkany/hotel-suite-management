import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, createdBy: any) {
    const { email, password, firstName, lastName, role, companyId } =
      createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        companyId,
        createdBy: createdBy.id,
        updatedBy: createdBy.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll(
    companyId: number,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
    }
  ) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      companyId,
      deletedAt: null,
    };

    // Add search filter
    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Add role filter
    if (query?.role) {
      where.role = query.role;
    }

    // Add status filter
    if (query?.status) {
      where.status = query.status;
    }

    // Get total count
    const total = await this.prisma.user.count({ where });

    // Get users
    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: number,
    companyId: number,
    requestUserRole: string,
    requestUserId: number
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can view their own profile or admins can view any user
    if (
      requestUserId !== id &&
      !['SUPER_ADMIN', 'ADMIN'].includes(requestUserRole)
    ) {
      throw new ForbiddenException('Access denied');
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    companyId: number,
    updatedBy: number
  ) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        updatedBy,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async remove(id: number, companyId: number, deletedBy: number) {
    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Cannot delete yourself
    if (id === deletedBy) {
      throw new BadRequestException('You cannot delete your own account');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });

    return { message: 'User deleted successfully' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedBy: userId,
      },
    });

    return { message: 'Password changed successfully' };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });
  }
}
