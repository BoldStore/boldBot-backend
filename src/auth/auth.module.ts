import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseStrategy } from './strategy';
import { UserStrategy } from './strategy/user.strategy';

@Module({
  imports: [PassportModule],
  providers: [FirebaseStrategy, UserStrategy],
  exports: [FirebaseStrategy, UserStrategy],
  controllers: [],
})
export class AuthModule {}
