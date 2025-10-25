import { Module } from '@nestjs/common';
import { LaundryOrdersService } from './laundry-orders.service';
import { LaundryOrdersController } from './laundry-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LaundryOrdersController],
  providers: [LaundryOrdersService],
  exports: [LaundryOrdersService],
})
export class LaundryOrdersModule {}
