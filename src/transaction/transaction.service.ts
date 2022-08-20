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
    const transaction = await this.prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        status: 'CONFIRMED',
      },
    });

    // Add subscription to user
    const subscription = await this.prisma.subscription.create({
      data: {
        userId: transaction.userId,
        pageId: transaction.pageId,
        startsAt: new Date(),
        endsAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'ACTIVE',
        transactionId: transaction.id,
      },
    });

    // TODO: Check for errors
    // TODO: Send email to user
    // TODO: Check for subscription errors

    return transaction;
  }
}
