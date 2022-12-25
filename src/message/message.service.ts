import { HttpException, Injectable } from '@nestjs/common';
import { SubscriptionStatus, User } from '@prisma/client';
import { GraphService } from 'src/graph/graph.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IceBreakerDto,
  PersistentMenuDto,
  StoryMentionDto,
  StoryReplyDto,
  TextDto,
} from './dto';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private graphService: GraphService,
  ) {}

  async addGreeting(user: User, dto: TextDto) {
    try {
      // Find if greeting exists
      const greeting = await this.prisma.message.findFirst({
        where: {
          userId: user.id,
          pageId: dto.pageId,
          type: 'greeting',
        },
      });

      if (greeting) {
        await this.prisma.text.deleteMany({
          where: {
            messageId: greeting.id,
          },
        });

        await this.prisma.text.createMany({
          data: dto.texts.map((text) => {
            return {
              messageId: greeting.id,
              key: text.key,
              value: text.value,
            };
          }),
        });

        return greeting;
      }

      const new_greeting = await this.prisma.message.create({
        data: {
          type: 'greeting',
          pageId: dto.pageId,
          userId: user.id,
          texts: {
            createMany: {
              data: dto.texts.map((text) => {
                return {
                  key: text.key,
                  value: text.value,
                };
              }),
            },
          },
        },
      });
      return new_greeting;
    } catch (e) {
      throw new HttpException('Could not add greetings', 500);
    }
  }

  async getGreetings(user: User, page_id: string) {
    const greetings = await this.prisma.message.findFirst({
      where: {
        userId: user.id,
        pageId: page_id,
        type: 'greeting',
      },
      include: {
        texts: true,
      },
    });
    return greetings;
  }

  async addIceBreaker(user: User, dto: IceBreakerDto) {
    try {
      const ice_breakers = [];
      const user_ice_breakers = new Array(...dto?.ice_breakers);
      user_ice_breakers.pop();
      let free = false;
      await this.prisma.message.deleteMany({
        where: {
          userId: user.id,
          pageId: dto.pageId,
          type: 'ice-breaker',
        },
      });

      const page = await this.prisma.page.findFirstOrThrow({
        where: {
          id: dto.pageId,
        },
      });

      const subscription = await this.prisma.subscription.findFirst({
        where: {
          userId: user.id,
          pageId: page.id,
          status: SubscriptionStatus.ACTIVE,
        },
        include: {
          plan: true,
        },
      });

      if (subscription.plan.price == 0) {
        free = true;
      }

      console.log(user_ice_breakers);

      for (let i = 0; i < user_ice_breakers?.length; i++) {
        const item = dto.ice_breakers[i];
        if (!item.question) continue;
        const ice_breaker = await this.prisma.message.create({
          data: {
            type: 'ice-breaker',
            question: item.question,
            pageId: dto.pageId,
            userId: user.id,
            texts: {
              createMany: {
                data: item.texts.map((text) => {
                  return {
                    key: text.key,
                    value: text.value,
                  };
                }),
              },
            },
          },
        });
        ice_breakers.push(ice_breaker);
      }

      if (free) {
        const ice_breaker = await this.prisma.message.create({
          data: {
            type: 'ice-breaker',
            question: 'How did I do this?',
            pageId: dto.pageId,
            userId: user.id,
            texts: {
              createMany: {
                data: [
                  {
                    key: '1',
                    value: 'Very easy! Just visit @boldbot.in',
                  },
                ],
              },
            },
          },
        });
        ice_breakers.push(ice_breaker);
      }

      await this.graphService.setIceBreakers(
        ice_breakers,
        page.page_access_token,
      );
      return ice_breakers;
    } catch (e) {
      throw new HttpException('Could not add ice-breakers', 500);
    }
  }

  async getIceBreakers(user: User, page_id: string) {
    const ice_breakers = await this.prisma.message.findMany({
      where: {
        userId: user.id,
        pageId: page_id,
        type: 'ice-breaker',
      },
      include: {
        texts: true,
      },
    });
    return ice_breakers;
  }

  async addPersistentMenu(user: User, dto: PersistentMenuDto) {
    try {
      const menu = [];
      const menu_list = [];
      await this.prisma.message.deleteMany({
        where: {
          userId: user.id,
          pageId: dto.pageId,
          type: 'persistent-menu',
        },
      });

      const page = await this.prisma.page.findFirstOrThrow({
        where: {
          id: dto.pageId,
        },
      });

      const subscription = await this.prisma.subscription.findFirst({
        where: {
          userId: user.id,
          pageId: dto.pageId,
          status: SubscriptionStatus.ACTIVE,
        },
        include: {
          plan: true,
        },
      });

      for (let i = 0; i < dto?.menu?.length; i++) {
        const item = dto.menu[i];
        if (!item.question) {
          continue;
        }
        const menu_item = await this.prisma.message.create({
          data: {
            type: 'persistent-menu',
            pageId: dto.pageId,
            userId: user.id,
            question: item.question,
            texts: {
              createMany: {
                data: item.texts.map((text) => {
                  return {
                    key: text.key,
                    value: text.value,
                  };
                }),
              },
            },
          },
        });
        menu.push(menu_item);
        menu_list.push(item?.question);
      }

      // If plan is free, do not let
      // user edit link
      // BOLDbot link will be shown
      if (subscription.plan.price == 0) {
        const web_data = await this.prisma.message.create({
          data: {
            type: 'persistent-menu',
            pageId: dto.pageId,
            userId: user.id,
            texts: {
              createMany: {
                data: {
                  key: 'Visit BOLDbot',
                  value: 'https://boldbot.in',
                },
              },
            },
          },
        });
        menu.push(web_data);
      }

      if (subscription.plan.price != 0 && dto.web_data) {
        const web_data = await this.prisma.message.create({
          data: {
            type: 'persistent-menu',
            pageId: dto.pageId,
            userId: user.id,
            texts: {
              createMany: {
                data: {
                  key: dto?.web_data?.title ?? '',
                  value: dto?.web_data?.url ?? '',
                },
              },
            },
          },
        });
        menu.push(web_data);
      }

      await this.graphService.setPersistentMenu(
        menu_list,
        page?.page_access_token,
        dto.web_data,
      );
      return menu;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async getPersistentMenu(user: User, page_id: string) {
    const menu = await this.prisma.message.findMany({
      where: {
        userId: user.id,
        pageId: page_id,
        type: 'persistent-menu',
      },
      include: {
        texts: true,
      },
    });
    return menu;
  }

  async addStoryReply(user: User, dto: StoryReplyDto) {
    try {
      const replies = [];
      await this.prisma.message.deleteMany({
        where: {
          userId: user.id,
          pageId: dto.pageId,
          type: 'story-reply',
        },
      });

      // TODO: Handle security - only allow person page things to set

      const page = await this.prisma.page.findFirstOrThrow({
        where: {
          id: dto.pageId,
          userId: user.id,
        },
      });

      for (let i = 0; i < dto?.replies?.length; i++) {
        const item = dto.replies[i];
        const reply_item = await this.prisma.message.create({
          data: {
            type: 'story-reply',
            pageId: page.id,
            userId: user.id,
            question: item.question,
            texts: {
              createMany: {
                data: item.texts.map((text) => {
                  return {
                    key: text.key,
                    value: text.value,
                  };
                }),
              },
            },
          },
        });
        replies.push(reply_item);
      }
      return replies;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async getStoryReplies(user: User, page_id: string) {
    const replies = await this.prisma.message.findMany({
      where: {
        userId: user.id,
        pageId: page_id,
        type: 'story-reply',
      },
      include: {
        texts: true,
      },
    });
    return replies;
  }

  async addStoryMention(user: User, dto: StoryMentionDto) {
    try {
      await this.prisma.message.deleteMany({
        where: {
          userId: user.id,
          pageId: dto.pageId,
          type: 'story-mention',
        },
      });

      // TODO: Handle security - only allow person page things to set

      const page = await this.prisma.page.findFirstOrThrow({
        where: {
          id: dto.pageId,
          userId: user.id,
        },
      });

      const reply_item = await this.prisma.message.create({
        data: {
          type: 'story-mention',
          pageId: page.id,
          userId: user.id,
          texts: {
            createMany: {
              data: dto.texts.map((text) => {
                return {
                  key: text.key,
                  value: text.value,
                };
              }),
            },
          },
        },
      });

      return reply_item;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async getStoryMentions(user: User, page_id: string) {
    const replies = await this.prisma.message.findMany({
      where: {
        userId: user.id,
        pageId: page_id,
        type: 'story-mention',
      },
      include: {
        texts: true,
      },
    });
    return replies;
  }
}
