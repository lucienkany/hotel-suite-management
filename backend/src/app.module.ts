import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InvitationModule } from './invitation/invitation.module';
import { UserModule } from './user/user.module';
import { RoomTypeModule } from './room-type/room-type.module';
import { RoomsModule } from './room/room.module';
import { ClientsModule } from './clients/clients.module';
import { StaysModule } from './stays/stays.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { RestaurantOrdersModule } from './restaurant-orders/restaurant-orders.module';
import { RestaurantTablesModule } from './restaurant-tables/restaurant-tables.module';
import { SupermarketOrdersModule } from './supermarket-orders/supermarket-orders.module';
import { LaundryOrdersModule } from './laundry-orders/laundry-orders.module';
import { SportReservationsModule } from './sport-reservations/sport-reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    InvitationModule,
    UserModule,
    RoomTypeModule,
    RoomsModule,
    ClientsModule,
    StaysModule,
    CategoriesModule,
    ProductsModule,
    RestaurantOrdersModule,
    RestaurantTablesModule,
    SupermarketOrdersModule,
    LaundryOrdersModule,
    SportReservationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
