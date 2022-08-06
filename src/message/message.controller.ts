import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { UserGuard } from 'src/auth/guard';
import { IceBreakerDto, TextDto } from './dto';
import { MessageService } from './message.service';

@UseGuards(UserGuard)
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('greeting')
  addGreeting(@GetUser() user: User, @Body() dto: TextDto) {
    return this.messageService.addGreeting(user, dto);
  }

  @Get('greeting')
  getGreetings(@GetUser() user: User, @Query('page') page_id: string) {
    return this.messageService.getGreetings(user, page_id);
  }

  @Post('ice-breaker')
  addIceBreaker(@GetUser() user: User, @Body() dto: IceBreakerDto) {
    return this.messageService.addIceBreaker(user, dto);
  }

  @Get('ice-breaker')
  getIceBreakers(@GetUser() user: User, @Query('page') page_id: string) {
    return this.messageService.getIceBreakers(user, page_id);
  }
}
