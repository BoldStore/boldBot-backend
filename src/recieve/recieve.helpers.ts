import { HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export class RecieveHelpers {
  constructor(private prisma: PrismaService) {}

  async validateLimit(userId: string, message_type: string) {
    try {
      const service = await this.prisma.services.findFirstOrThrow({
        where: {
          name: message_type,
        },
      });

      // Get page
      const page = await this.prisma.page.findFirstOrThrow({
        where: {
          userId: userId,
        },
      });

      const subscription = await this.prisma.subscription.findFirstOrThrow({
        where: {
          userId: userId,
          pageId: page.id,
          status: 'ACTIVE',
        },
      });

      const transaction = await this.prisma.transaction.findFirstOrThrow({
        where: {
          id: subscription.transactionId,
        },
      });

      const service_amount_relation =
        await this.prisma.serviceAmountRelation.findFirstOrThrow({
          where: {
            serviceId: service.id,
            planId: transaction.planId,
          },
        });

      const stats = await this.prisma.stats.findFirstOrThrow({
        where: {
          userId: userId,
          pageId: page.id,
        },
      });

      if (stats) {
        const relation = await this.prisma.serviceAmountRelation.findFirst({
          where: {
            serviceId: service.id,
            statsId: stats.id,
          },
        });

        if (relation) {
          if (relation.amount >= service_amount_relation.amount) {
            throw new HttpException('Limit exceeded', 500);
          }
        } else {
          // Create relation
          await this.prisma.serviceAmountRelation.create({
            data: {
              amount: 0,
              serviceId: service.id,
              statsId: stats.id,
            },
          });
        }
      } else {
        // Create stat
        await this.prisma.stats.create({
          data: {
            userId: userId,
            pageId: page.id,
          },
        });
      }

      return true;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async addCount(userId: string, message_type: string) {
    try {
      const service = await this.prisma.services.findFirst({
        where: {
          name: message_type,
        },
      });

      // Get page
      const page = await this.prisma.page.findFirst({
        where: {
          userId: userId,
        },
      });

      const stats = await this.prisma.stats.findFirst({
        where: {
          userId: userId,
          pageId: page.id,
        },
      });

      if (stats) {
        const relation = await this.prisma.serviceAmountRelation.findFirst({
          where: {
            serviceId: service.id,
            statsId: stats.id,
          },
        });

        if (relation) {
          // Update stat count
          await this.prisma.serviceAmountRelation.update({
            where: {
              id: relation.id,
            },
            data: {
              amount: { increment: 1 },
              serviceId: service.id,
              statsId: stats.id,
            },
          });
        } else {
          // Create stat count
          await this.prisma.serviceAmountRelation.create({
            data: {
              amount: 1,
              serviceId: service.id,
              statsId: stats.id,
            },
          });
        }
      } else {
        // Create stat
        const stat = await this.prisma.stats.create({
          data: {
            userId: userId,
            pageId: page.id,
          },
        });

        // Create stat count
        await this.prisma.serviceAmountRelation.create({
          data: {
            amount: 1,
            serviceId: service.id,
            statsId: stat.id,
          },
        });
      }

      return {
        message: 'ok',
      };
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
