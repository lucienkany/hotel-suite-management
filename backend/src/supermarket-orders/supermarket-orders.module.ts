import { Module } from '@nestjs/common';
import { SupermarketOrdersService } from './supermarket-orders.service';
import { SupermarketOrdersController } from './supermarket-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupermarketOrdersController],
  providers: [SupermarketOrdersService],
  exports: [SupermarketOrdersService],
})
export class SupermarketOrdersModule {}
