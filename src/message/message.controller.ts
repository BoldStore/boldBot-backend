import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { UserGuard } from 'src/auth/guard';
import { TextDto } from './dto';
import { MessageService } from './message.service';

@UseGuards(UserGuard)
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('greeting')
  addGreeting(@GetUser() user: User, @Body() dto: TextDto) {
    return this.messageService.addGreeting(user, dto);
  }
}
