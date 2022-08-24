import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { UserGuard } from 'src/auth/guard';
import {
  IceBreakerDto,
  PersistentMenuDto,
  StoryMentionDto,
  StoryReplyDto,
  TextDto,
} from './dto';
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

  @Post('persistent-menu')
  addPersistentMenu(@GetUser() user: User, @Body() dto: PersistentMenuDto) {
    return this.messageService.addPersistentMenu(user, dto);
  }

  @Get('persistent-menu')
  getPersistentMenu(@GetUser() user: User, @Query('page') page_id: string) {
    return this.messageService.getPersistentMenu(user, page_id);
  }

  @Post('story-reply')
  addStoryReply(@GetUser() user: User, @Body() dto: StoryReplyDto) {
    return this.messageService.addStoryReply(user, dto);
  }

  @Get('story-reply')
  getStoryReplies(@GetUser() user: User, @Query('page') page_id: string) {
    return this.messageService.getStoryMentions(user, page_id);
  }

  @Post('story-mention')
  addStoryMention(@GetUser() user: User, @Body() dto: StoryMentionDto) {
    return this.messageService.addStoryMention(user, dto);
  }

  @Get('story-mention')
  getStoryMention(@GetUser() user: User, @Query('page') page_id: string) {
    return this.messageService.getStoryMentions(user, page_id);
  }
}
