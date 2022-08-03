import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TextDto } from './dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async addGreeting(user: User, dto: TextDto) {
    const greeting = await this.prisma.message.create({
      data: {
        type: 'greeting',
        pageId: dto.pageId,
        userId: user.id,
        texts: {
          create: {
            key: dto.key,
            value: dto.value,
          },
        },
      },
    });
    return greeting;
  }
}
