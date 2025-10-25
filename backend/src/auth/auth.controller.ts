import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { SignupCompanyDto } from './dto/signup-company.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup-company')
  @ApiOperation({ summary: 'Sign up new company with admin user' })
  @HttpCode(HttpStatus.CREATED)
  async signupCompany(@Body() signupCompanyDto: SignupCompanyDto) {
    return this.authService.signupCompany(signupCompanyDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new company and admin user' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('accept-invitation')
  @ApiOperation({ summary: 'Accept invitation and create account' })
  @HttpCode(HttpStatus.CREATED)
  async acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(acceptInvitationDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.userId);
  }
}
