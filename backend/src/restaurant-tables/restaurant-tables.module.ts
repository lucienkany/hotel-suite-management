import { Module } from '@nestjs/common';
import { RestaurantTablesService } from './restaurant-tables.service';
import { RestaurantTablesController } from './restaurant-tables.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantTablesController],
  providers: [RestaurantTablesService],
  exports: [RestaurantTablesService],
})
export class RestaurantTablesModule {}
