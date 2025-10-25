import { Module } from '@nestjs/common';
import { RoomsController } from '../room/room.controller';
import { RoomsService } from '../room/room.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
