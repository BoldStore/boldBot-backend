import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { FirebaseUser } from '@tfarras/nestjs-firebase-auth';
import { GetUser } from 'src/auth/decorator';
import { FirebaseGuard, UserGuard } from 'src/auth/guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @UseGuards(FirebaseGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @UseGuards(UserGuard)
  @Post()
  createUser(@GetUser() user: FirebaseUser) {
    return this.service.createUser(user);
  }
}
