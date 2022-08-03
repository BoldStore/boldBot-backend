import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TextDto } from './dto';

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
}
