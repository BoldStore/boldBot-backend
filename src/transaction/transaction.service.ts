import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
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
    const plans = await this.prisma.pricingPlan.findMany();
    return plans;
  }

  async buyPlan(user: User): Promise<any> {
    // TODO: Get plan id
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      include: {
        transaction: true,
      },
    });

    if (subscription) {
      // TODO: Calulate extra amount to pay
      if (subscription.transaction.expiresAt > new Date()) {
        // TODO: Get number of days remaining
        const remainingDays = Math.round(
          (subscription.transaction.expiresAt.getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );
      }
    }

    const plan = await this.prisma.pricingPlan.findFirst({
      where: {
        id: 'planId',
      },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: user.id,
        amount: plan.price,
        expiresAt: new Date(
          new Date().setDate(new Date().getDate() + plan.days),
        ),
        startsAt: new Date(),
        planId: plan.id,
        status: 'pending',
        currency: plan.currency,
      },
    });

    // Add to razorpay

    return transaction;
  }

  async verifyTransaction(transactionId: string): Promise<any> {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: {
        id: transactionId,
        status: 'pending',
      },
    });

    // TODO: Verify transaction with razorpay
    const updated_transaction = await this.prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'confirmed',
      },
    });

    return updated_transaction;
  }
}
