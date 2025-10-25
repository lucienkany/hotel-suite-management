import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import * as crypto from 'crypto';

@Injectable()
export class InvitationService {
  constructor(private prisma: PrismaService) {}

  async createInvitation(
    userId: number,
    createInvitationDto: CreateInvitationDto
  ) {
    // Get the user creating the invitation
    const inviter = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!inviter || inviter.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // Check if inviter is ADMIN or MANAGER
    if (inviter.role !== 'ADMIN' && inviter.role !== 'MANAGER') {
      throw new ForbiddenException(
        'Only ADMIN or MANAGER can send invitations'
      );
    }

    // Check if email is already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createInvitationDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if there's a pending invitation for this email in this company
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: createInvitationDto.email,
        companyId: inviter.companyId,
        acceptedAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw new BadRequestException(
        'Pending invitation already exists for this email'
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        email: createInvitationDto.email,
        role: createInvitationDto.role,
        token,
        expiresAt,
        companyId: inviter.companyId,
        invitedBy: userId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Generate invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${token}`;

    // TODO: Send email with invitation link
    // await this.emailService.sendInvitationEmail(invitation.email, invitationLink, invitation.company.name);

    return {
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        invitationLink,
        expiresAt: invitation.expiresAt,
        company: invitation.company,
        invitedBy: invitation.inviter,
      },
    };
  }

  async getInvitations(userId: number) {
    // Get the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // Check if user is ADMIN or MANAGER
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException(
        'Only ADMIN or MANAGER can view invitations'
      );
    }

    // Get all invitations for the user's company
    const invitations = await this.prisma.invitation.findMany({
      where: {
        companyId: user.companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        acceptedByUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.acceptedAt
          ? 'accepted'
          : new Date() > inv.expiresAt
            ? 'expired'
            : 'pending',
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        company: inv.company,
        invitedBy: inv.inviter,
        acceptedBy: inv.acceptedByUser,
      })),
    };
  }

  async getInvitationByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            companyAddress: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException(
        'This invitation has already been accepted'
      );
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('This invitation has expired');
    }

    return {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        company: invitation.company,
        invitedBy: invitation.inviter,
      },
    };
  }

  async resendInvitation(userId: number, invitationId: number) {
    // Get the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // Check if user is ADMIN or MANAGER
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException(
        'Only ADMIN or MANAGER can resend invitations'
      );
    }

    // Get the invitation
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        company: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if invitation belongs to user's company
    if (invitation.companyId !== user.companyId) {
      throw new ForbiddenException(
        'You can only resend invitations from your company'
      );
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      throw new BadRequestException('Cannot resend an accepted invitation');
    }

    // Generate new token and extend expiration
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Update invitation
    const updatedInvitation = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token,
        expiresAt,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Generate new invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${token}`;

    // TODO: Send email with new invitation link
    // await this.emailService.sendInvitationEmail(updatedInvitation.email, invitationLink, updatedInvitation.company.name);

    return {
      message: 'Invitation resent successfully',
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        token: updatedInvitation.token,
        invitationLink,
        expiresAt: updatedInvitation.expiresAt,
      },
    };
  }

  async cancelInvitation(userId: number, invitationId: number) {
    // Get the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    // Check if user is ADMIN or MANAGER
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException(
        'Only ADMIN or MANAGER can cancel invitations'
      );
    }

    // Get the invitation
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Check if invitation belongs to user's company
    if (invitation.companyId !== user.companyId) {
      throw new ForbiddenException(
        'You can only cancel invitations from your company'
      );
    }

    // Check if already accepted
    if (invitation.acceptedAt) {
      throw new BadRequestException('Cannot cancel an accepted invitation');
    }

    // Delete the invitation
    await this.prisma.invitation.delete({
      where: { id: invitationId },
    });

    return {
      message: 'Invitation cancelled successfully',
    };
  }
}
