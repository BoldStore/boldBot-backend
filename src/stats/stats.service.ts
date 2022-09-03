import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as MessageTypes from '../message_types';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: User, page_id: string) {
    const greetings: number = await this.prisma.messageCount.count({
      where: {
        userId: user.id,
        pageId: page_id,
        service: {
          name: MessageTypes.GREETING,
        },
      },
    });
    const ice_breakers: number = await this.prisma.messageCount.count({
      where: {
        userId: user.id,
        pageId: page_id,
        service: {
          name: MessageTypes.ICE_BREAKER,
        },
      },
    });
    const persistent_menu: number = await this.prisma.messageCount.count({
      where: {
        userId: user.id,
        pageId: page_id,
        service: {
          name: MessageTypes.PERSISTENT_MENU,
        },
      },
    });
    const story_replies: number = await this.prisma.messageCount.count({
      where: {
        userId: user.id,
        pageId: page_id,
        service: {
          name: MessageTypes.STORY_REPLY,
        },
      },
    });
    const story_mentions: number = await this.prisma.messageCount.count({
      where: {
        userId: user.id,
        pageId: page_id,
        service: {
          name: MessageTypes.STORY_MENTION,
        },
      },
    });
    return {
      greetings,
      ice_breakers,
      persistent_menu,
      story_mentions,
      story_replies,
    };
  }
}
