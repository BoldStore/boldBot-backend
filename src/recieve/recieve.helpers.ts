import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Page, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from 'src/webhook/dto';

@Injectable()
export class RecieveHelpers {
  private readonly logger = new Logger(RecieveHelpers.name);
  constructor(private prisma: PrismaService) {}

  // Basically validates if person has exhausted the quota
  async validateLimit(page: Page, message_type: string) {
    try {
      // Check for active subscription
      const subscription = await this.prisma.subscription.findFirstOrThrow({
        where: {
          userId: page.userId,
          pageId: page.id,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      // To check for the realtion of service the
      // user is requesting
      const service_amount_relation =
        await this.prisma.serviceAmountRelation.findFirstOrThrow({
          where: {
            serviceName: message_type,
            planId: subscription.planId,
          },
        });

      const used = await this.prisma.messageCount.count({
        where: {
          serviceName: message_type,
          pageId: page.id,
          userId: page.userId,
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

  async addCount(
    userId: string,
    message_type: string,
    insta_customer: UserDto,
    failed = false,
  ) {
    try {
      // Get page
      const page = await this.prisma.page.findFirst({
        where: {
          userId: userId,
        },
      });

      if (failed) {
        const messageCount = await this.prisma.messageCount.create({
          data: {
            pageId: page.id,
            userId: userId,
            serviceName: message_type,
            failed: true,
          },
        });

        return {
          message: 'ok',
          count: messageCount,
        };
      }

      // Check if customer exists
      let customer = await this.prisma.customer.findFirst({
        where: {
          insta_id: insta_customer.insta_id,
        },
      });

      let customer_user = null;

      if (customer) {
        customer_user = await this.prisma.customerUser.findFirst({
          where: {
            customerId: customer.id,
            userId: page.userId,
          },
        });

        if (!customer_user) {
          // Create a relationship with customer
          customer_user = await this.prisma.customerUser.create({
            data: {
              customerId: customer.id,
              userId: userId,
            },
          });
        }
      } else {
        customer = await this.prisma.customer.create({
          data: {
            insta_id: insta_customer.insta_id,
            name: insta_customer.name,
            username: insta_customer.username,
          },
        });

        customer_user = await this.prisma.customerUser.create({
          data: {
            customerId: customer.id,
            userId: userId,
          },
        });
      }

      const messageCount = await this.prisma.messageCount.create({
        data: {
          pageId: page.id,
          userId: userId,
          serviceName: message_type,
          customerId: customer.id,
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
