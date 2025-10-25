import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CustomerType } from '../common/constants';

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
    UserRole.RECEPTIONIST
  )
  findAll(
    @Request() req,
    @Query('customerType') customerType?: CustomerType,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.clientsService.findAll(
      req.user.companyId,
      customerType,
      search,
      page,
      limit
    );
  }

  @Get('corporate')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
  )
  getCorporateClients(
    @Request() req,
    @Query('sponsorCompanyId', new ParseIntPipe({ optional: true }))
    sponsorCompanyId?: number
  ) {
    return this.clientsService.getCorporateClients(
      req.user.companyId,
      sponsorCompanyId
    );
  }

  @Get('search')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.RECEPTIONIST
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
    UserRole.RECEPTIONIST
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
    UserRole.RECEPTIONIST
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
    UserRole.RECEPTIONIST
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
