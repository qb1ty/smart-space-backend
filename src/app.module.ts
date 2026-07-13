import { Module } from '@nestjs/common';
import { CacheModule } from "@nestjs/cache-manager"
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SpacesModule } from './spaces/spaces.module';
import { BookingModule } from './booking/booking.module';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [new KeyvRedis(`redis://localhost:${process.env.REDIS_PORT || 6379}`)],
        ttl: 3600000
      })
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SpacesModule,
    BookingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
