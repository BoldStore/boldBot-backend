import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionStatus } from '@prisma/client';
import { GraphService } from 'src/graph/graph.service';
import { PrismaService } from 'src/prisma/prisma.service';

// TODO: Maybe optimized
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private graphService: GraphService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async handleCron() {
    this.logger.debug('Running Cron for long lived access token');
    // Get all pages
    const pages = await this.prisma.page.findMany();
    // for each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      // update token
      const data = await this.graphService.getLongLivedToken(
        page.page_access_token,
      );
      const access_token = data.access_token;
      await this.prisma.page.update({
        where: {
          id: page.id,
        },
        data: {
          page_access_token: access_token,
        },
      });
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkSubscription() {
    this.logger.debug('Running Cron for checking for subscription');
    // Get all pages
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endsAt: { lte: new Date() },
      },
    });

    // for each page
    for (let i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i];
      // deactivate subscription
      await this.prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.INACTIVE,
        },
      });

      // Set the next subscription as active, if any
      const new_sub = await this.prisma.subscription.findFirst({
        where: {
          status: SubscriptionStatus.QUEUED,
        },
        include: {
          plan: true,
        },
      });

      await this.prisma.subscription.update({
        where: {
          id: new_sub.id,
        },
        data: {
          startsAt: new Date(),
          endsAt: new Date(new Date().addDays(new_sub.plan.days)),
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }
  }
}
