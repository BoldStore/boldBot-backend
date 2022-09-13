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

      // This means all is good
      // Limit not exceeded
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

      // TODO: Add customer
      // Check if customer exists
      // const customer = await this.prisma.customer.findFirst({
      //   where: {
      //     insta_id: user.insta_id,
      //   },
      // });

      // if (customer) {
      //   const customer_user = await this.prisma.customerUser.findFirst({
      //     where: {
      //       userId: page.userId,
      //     },
      //   });

      //   if (!customer_user) {
      //     // Create a relationship with customer
      //   }
      // } else {
      //   const new_customer = await this.prisma.customer.create({
      //     data: {
      //       insta_id: insta_id,
      //       name: userProfile.name,
      //       username: userProfile.username,
      //     },
      //   });
      // }

      const messageCount = await this.prisma.messageCount.create({
        data: {
          pageId: page.id,
          userId: userId,
          serviceId: service.id,
        },
      });

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
