import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecieveHelpers {
  private readonly logger = new Logger(RecieveHelpers.name);
  constructor(private prisma: PrismaService) {}

  // Basically validates if person has exhausted the quota
  async validateLimit(userId: string, message_type: string) {
    try {
      // To check which service the user is requesting
      const service = await this.prisma.services.findFirstOrThrow({
        where: {
          name: message_type,
        },
      });

      // Get page of the user
      // which is requesting the service
      const page = await this.prisma.page.findFirstOrThrow({
        where: {
          userId: userId,
        },
      });

      // Check for active subscription
      const subscription = await this.prisma.subscription.findFirstOrThrow({
        where: {
          userId: userId,
          pageId: page.id,
          status: 'ACTIVE',
        },
      });

      // Get transaction to get the plan ID
      // Why PlanID?
      // To get the limit available to the user
      const transaction = await this.prisma.transaction.findFirstOrThrow({
        where: {
          id: subscription.transactionId,
        },
      });

      // To check for the realtion of service the
      // user is requesting
      const service_amount_relation =
        await this.prisma.serviceAmountRelation.findFirstOrThrow({
          where: {
            serviceId: service.id,
            planId: transaction.planId,
          },
        });

      // Get the user stats
      // To check the amount
      // user has used
      // const stats = await this.prisma.stats.findFirst({
      //   where: {
      //     userId: userId,
      //     pageId: page.id,
      //   },
      // });

      const used = await this.prisma.messageCount.count({
        where: {
          serviceId: service.id,
          pageId: page.id,
          userId: userId,
        },
      });

      if (used >= service_amount_relation.replies) {
        throw new HttpException('Limit exceeded', 500);
      }

      // if (stats) {
      // Why Relation?
      // relation is the amount
      // of services used for a page
      // Basically this is what is inside
      // of stats
      // const relation = await this.prisma.serviceAmountRelation.findFirst({
      //   where: {
      //     serviceId: service.id,
      //     statsId: stats.id,
      //   },
      // });

      // If relation exists,
      // check for the limit
      // if (relation) {
      //   if (relation.amount >= service_amount_relation.replies) {
      //     throw new HttpException('Limit exceeded', 500);
      //   }
      // }
      // If first time,
      // Create the realtion and increase the replies
      // count
      // else {
      // Create relation
      // await this.prisma.serviceAmountRelation.create({
      //   data: {
      //     replies: 0,
      //     serviceId: service.id,
      //     statsId: stats.id,
      //   },
      // });
      // }
      // } else {
      //   // Create stat
      //   // If it doesn't exist to store the relation
      //   const stat = await this.prisma.stats.create({
      //     data: {
      //       userId: userId,
      //       pageId: page.id,
      //     },
      //   });

      //   // Also, create the relation for above mentioned reason
      //   await this.prisma.serviceAmountRelation.create({
      //     data: {
      //       replies: 0,
      //       serviceId: service.id,
      //       statsId: stat.id,
      //     },
      //   });
      // }

      // This means all is good
      // Limit not exceeded
      return true;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async addCount(userId: string, message_type: string) {
    try {
      // TODO: Maybe only send page? would be easier to handle ig
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

      // TODO: Now we dont need stats we can directly
      // add a message - simpler and more elegant

      // TODO: Add customer

      const messageCount = await this.prisma.messageCount.create({
        data: {
          pageId: page.id,
          userId: userId,
          serviceId: service.id,
        },
      });

      // const stats = await this.prisma.stats.findFirst({
      //   where: {
      //     userId: userId,
      //     pageId: page.id,
      //   },
      // });

      // if (stats) {
      //   const relation = await this.prisma.serviceAmountRelation.findFirst({
      //     where: {
      //       serviceId: service.id,
      //       statsId: stats.id,
      //     },
      //   });

      //   if (relation) {
      //     // Update stat count
      //     await this.prisma.serviceAmountRelation.update({
      //       where: {
      //         id: relation.id,
      //       },
      //       data: {
      //         amount: { increment: 1 },
      //         serviceId: service.id,
      //         statsId: stats.id,
      //       },
      //     });
      //   } else {
      //     // Create stat count
      //     await this.prisma.serviceAmountRelation.create({
      //       data: {
      //         amount: 1,
      //         serviceId: service.id,
      //         statsId: stats.id,
      //       },
      //     });
      //   }
      // } else {
      //   // Create stat
      //   const stat = await this.prisma.stats.create({
      //     data: {
      //       userId: userId,
      //       pageId: page.id,
      //     },
      //   });

      //   // Create stat count
      //   await this.prisma.serviceAmountRelation.create({
      //     data: {
      //       amount: 1,
      //       serviceId: service.id,
      //       statsId: stat.id,
      //     },
      //   });
      // }

      return {
        message: 'ok',
        count: messageCount,
      };
    } catch (e) {
      this.logger.debug('ERROR while counting>>>', e);
      throw new HttpException(e.message, 500);
    }
  }
}
