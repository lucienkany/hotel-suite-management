import { Module } from '@nestjs/common';
import { StaysController } from './stays.controller';
import { StaysService } from './stays.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StaysController],
  providers: [StaysService],
  exports: [StaysService],
})
export class StaysModule {}
