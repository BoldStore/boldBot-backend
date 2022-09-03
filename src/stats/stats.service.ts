import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: User, page_id: string) {
    const count = await this.prisma.messageCount.groupBy({
      by: ['serviceId'],
      _count: true,
      where: {
        userId: user.id,
        pageId: page_id,
      },
    });

    const services = [];

    for (let i = 0; i < count.length; i++) {
      const serviceId = count[i].serviceId;
      services.push(
        await this.prisma.services.findFirst({
          where: {
            id: serviceId,
          },
          select: {
            name: true,
            id: true,
          },
        }),
      );
    }

    return {
      count: count.map((e) => {
        const service = services.find(
          (service_data) => service_data.id == e.serviceId,
        );
        return {
          service: service.name,
          count: e._count,
        };
      }),
    };
  }
}
