import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: User, page_id: string) {
    const count = await this.prisma.messageCount.groupBy({
      by: ['serviceName'],
      _count: true,
      where: {
        userId: user.id,
        pageId: page_id,
      },
    });

    return count;
  }
}
