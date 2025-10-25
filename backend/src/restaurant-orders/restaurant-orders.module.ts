import { Module } from '@nestjs/common';
import { RestaurantOrdersController } from './restaurant-orders.controller';
import { RestaurantOrdersService } from './restaurant-orders.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RestaurantOrdersController],
  providers: [RestaurantOrdersService],
  exports: [RestaurantOrdersService],
})
export class RestaurantOrdersModule {}
