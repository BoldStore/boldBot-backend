import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseStrategy, UserStrategy } from './strategy';

@Module({
  imports: [PassportModule],
  providers: [FirebaseStrategy, UserStrategy],
  exports: [FirebaseStrategy, UserStrategy],
  controllers: [],
})
export class AuthModule {}
