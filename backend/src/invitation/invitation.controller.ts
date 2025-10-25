import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create and send invitation (ADMIN/MANAGER only)' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async createInvitation(
    @Request() req,
    @Body() createInvitationDto: CreateInvitationDto
  ) {
    return this.invitationService.createInvitation(
      req.user.userId,
      createInvitationDto
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all invitations for company (ADMIN/MANAGER only)',
  })
  @ApiResponse({ status: 200, description: 'List of invitations' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getInvitations(@Request() req) {
    return this.invitationService.getInvitations(req.user.userId);
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Verify invitation token (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Invitation details' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @ApiResponse({
    status: 400,
    description: 'Invitation expired or already accepted',
  })
  async getInvitationByToken(@Param('token') token: string) {
    return this.invitationService.getInvitationByToken(token);
  }

  @Post('resend/:invitationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend invitation (ADMIN/MANAGER only)' })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async resendInvitation(
    @Request() req,
    @Param('invitationId') invitationId: string
  ) {
    return this.invitationService.resendInvitation(
      req.user.userId,
      parseInt(invitationId)
    );
  }

  @Delete(':invitationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel invitation (ADMIN/MANAGER only)' })
  @ApiResponse({
    status: 200,
    description: 'Invitation cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async cancelInvitation(
    @Request() req,
    @Param('invitationId') invitationId: string
  ) {
    return this.invitationService.cancelInvitation(
      req.user.userId,
      parseInt(invitationId)
    );
  }
}
