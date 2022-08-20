import { HttpException, Injectable } from '@nestjs/common';
import { SubscriptionStatus, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getTransactions(user: User): Promise<any> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      include: {
        plan: true,
      },
    });

    return transactions;
  }

  async addSubscription(): Promise<any> {
    return 'This action adds a new subscription';
  }

  async getPlans(): Promise<any> {
    const plans = await this.prisma.plan.findMany();
    return plans;
  }

  async buyPlan(user: User): Promise<any> {
    // Check if user has a page
    const page = await this.prisma.page.findFirstOrThrow({
      where: {
        userId: user.id,
      },
    });

    // TODO: get plan Id
    const plan = await this.prisma.plan.findFirstOrThrow({
      where: {
        name: 'Basic',
      },
    });

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        status: 'PENDING',
        pageId: page.id,
      },
    });

    return transaction;
  }

  async verifyTransaction(transactionId: string): Promise<any> {
    try {
      // TODO: Integrate razorpay
      const transaction = await this.prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          status: 'CONFIRMED',
        },
        include: {
          plan: true,
        },
      });

      // If not - Create subscription
      let status: SubscriptionStatus = 'ACTIVE';

      // Check for subscription
      const userSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: transaction.userId,
          status: 'ACTIVE',
        },
      });
      // If exists - Add to queue
      if (userSubscription) {
        status = 'QUEUED';
      }

      // Add subscription to user
      const subscription = await this.prisma.subscription.create({
        data: {
          userId: transaction.userId,
          pageId: transaction.pageId,
          startsAt: status == 'ACTIVE' ? new Date() : null,
          endsAt: new Date(new Date().addDays(transaction.plan.days)),
          status,
          transactionId: transaction.id,
        },
      });

      // TODO: Send email to user

      return subscription;
    } catch (e) {
      throw new HttpException(e, 500);
    }
  }
}
