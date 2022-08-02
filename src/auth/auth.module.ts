import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FirebaseStrategy } from './strategy';
import { UserStrategy } from './strategy/user.strategy';

@Module({
  imports: [PassportModule, PrismaModule],
  providers: [FirebaseStrategy, UserStrategy],
  exports: [FirebaseStrategy, UserStrategy],
  controllers: [],
})
export class AuthModule {}
