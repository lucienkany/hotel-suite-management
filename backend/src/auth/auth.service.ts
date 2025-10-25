import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { SignupCompanyDto } from './dto/signup-company.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signupCompany(signupCompanyDto: SignupCompanyDto) {
    // Validate input
    if (
      !signupCompanyDto.companyName ||
      !signupCompanyDto.adminEmail ||
      !signupCompanyDto.adminPassword
    ) {
      throw new BadRequestException('All required fields must be provided');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupCompanyDto.adminEmail },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      signupCompanyDto.adminPassword,
      10
    );

    // Create company and admin user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: signupCompanyDto.companyName,
          companyAddress: signupCompanyDto.companyAddress,
          email: signupCompanyDto.domain,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: signupCompanyDto.adminEmail,
          password: hashedPassword,
          firstName: signupCompanyDto.adminFirstName || 'Admin',
          lastName: signupCompanyDto.adminLastName || 'User',
          role: 'ADMIN',
          companyId: company.id,
        },
        include: {
          company: true,
        },
      });

      return { company, user };
    });

    // Generate JWT token
    const payload = {
      email: result.user.email,
      sub: result.user.id,
      companyId: result.user.companyId,
      role: result.user.role,
    };

    const access_token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = result.user;

    return {
      access_token,
      user: userWithoutPassword,
      company: result.company,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create company and admin user in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create company
      const company = await prisma.company.create({
        data: {
          name: registerDto.companyName,
          email: registerDto.companyEmail,
          phone: registerDto.companyPhone,
          companyAddress: registerDto.companyAddress,
        },
      });

      // Create admin user
      const user = await prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: 'ADMIN',
          companyId: company.id,
        },
        include: {
          company: true,
        },
      });

      return { user, company };
    });

    // Generate JWT token
    const token = this.generateToken(result.user);

    const { password: _, ...userWithoutPassword } = result.user;

    return {
      message: 'Registration successful',
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        role: userWithoutPassword.role,
        company: userWithoutPassword.company,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        company: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Login successful',
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        role: userWithoutPassword.role,
        company: userWithoutPassword.company,
      },
      token,
    };
  }

  async acceptInvitation(acceptInvitationDto: AcceptInvitationDto) {
    // Find invitation
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: acceptInvitationDto.token },
      include: {
        company: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Invitation already accepted');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(acceptInvitationDto.password, 10);

    // Create user and update invitation in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          firstName: acceptInvitationDto.firstName,
          lastName: acceptInvitationDto.lastName,
          role: invitation.role,
          companyId: invitation.companyId,
        },
        include: {
          company: true,
        },
      });

      // Update invitation as accepted
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(),
        },
      });

      return user;
    });

    // Generate JWT token
    const token = this.generateToken(result);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;

    return {
      message: 'Invitation accepted successfully',
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        role: userWithoutPassword.role,
        company: userWithoutPassword.company,
      },
      token,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      firstName: userWithoutPassword.firstName,
      lastName: userWithoutPassword.lastName,
      role: userWithoutPassword.role,
      company: userWithoutPassword.company,
    };
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return this.jwtService.sign(payload);
  }
}
