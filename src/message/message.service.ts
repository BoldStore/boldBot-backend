import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IceBreakerDto, TextDto } from './dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async addGreeting(user: User, dto: TextDto) {
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
    const ice_breakers = [];
    await this.prisma.message.deleteMany({
      where: {
        userId: user.id,
        pageId: dto.pageId,
        type: 'ice-breaker',
      },
    });

    for (let i = 0; i < dto?.ice_breakers?.length; i++) {
      const item = dto.ice_breakers[i];
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
    return ice_breakers;
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
}
