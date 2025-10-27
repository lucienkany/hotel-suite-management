import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CustomerType, UserRole } from '../common/constants';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST
  )
  create(@Body() createClientDto: CreateClientDto, @Request() req) {
    return this.clientsService.create(
      createClientDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST,
    UserRole.CASHIER
  )
  findAll(
    @Request() req,
    @Query('customerType') customerType?: CustomerType,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    // Manual parsing for optional parameters
    const parsedPage = page ? parseInt(page, 10) : undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    return this.clientsService.findAll(
      req.user.companyId,
      customerType,
      search,
      parsedPage,
      parsedLimit
    );
  }

  @Get('corporate')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST,
    UserRole.CASHIER
  )
  getCorporateClients(
    @Request() req,
    @Query('sponsorCompanyId') sponsorCompanyId?: string
  ) {
    // Manual parsing for optional parameter
    const parsedSponsorCompanyId = sponsorCompanyId
      ? parseInt(sponsorCompanyId, 10)
      : undefined;

    return this.clientsService.getCorporateClients(
      req.user.companyId,
      parsedSponsorCompanyId
    );
  }

  @Get('search')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST,
    UserRole.CASHIER
  )
  searchByPhoneOrEmail(@Request() req, @Query('q') query: string) {
    return this.clientsService.searchByPhoneOrEmail(req.user.companyId, query);
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST,
    UserRole.CASHIER
  )
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clientsService.findOne(id, req.user.companyId);
  }

  @Get(':id/statistics')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST,
    UserRole.CASHIER
  )
  getClientStatistics(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clientsService.getClientStatistics(id, req.user.companyId);
  }

  @Get(':id/balance')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST,
    UserRole.CASHIER
  )
  getClientBalance(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clientsService.getClientBalance(id, req.user.companyId);
  }

  @Patch(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.RECEPTIONIST
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req
  ) {
    return this.clientsService.update(
      id,
      updateClientDto,
      req.user.companyId,
      req.user.userId
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clientsService.remove(id, req.user.companyId, req.user.userId);
  }
}
