import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { FirebaseUser } from '@tfarras/nestjs-firebase-auth';
import { GetUser } from 'src/auth/decorator';
import { FirebaseGuard, UserGuard } from 'src/auth/guard';
import { PageDto } from './dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @UseGuards(UserGuard)
  @Get('me')
  getMe(@GetUser() user: User) {
    return this.service.getMe(user);
  }

  @UseGuards(FirebaseGuard)
  @Post()
  createUser(@GetUser() user: FirebaseUser) {
    return this.service.createUser(user);
  }

  @UseGuards(UserGuard)
  @Post('page')
  addPage(@GetUser() user: User, @Body() dto: PageDto) {
    return this.service.addPage(user, dto);
  }
}
