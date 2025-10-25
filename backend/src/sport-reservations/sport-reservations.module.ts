// sport-reservations.module.ts
import { Module } from '@nestjs/common';
import { SportReservationsService } from './sport-reservations.service';
import { SportReservationsController } from './sport-reservations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SportReservationsController],
  providers: [SportReservationsService],
  exports: [SportReservationsService],
})
export class SportReservationsModule {}
