import { HttpException, Injectable } from '@nestjs/common';
import { SubscriptionStatus, TransactionStatus, User } from '@prisma/client';
import { InjectRazorpay } from 'nestjs-razorpay';
import { PrismaService } from 'src/prisma/prisma.service';
import { BuyDto, PlanDto } from './dto';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    @InjectRazorpay() private readonly razorpayClient,
  ) {}

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

  async addPlan(dto: PlanDto): Promise<any> {
    // Create plan on razorpay
    const razorpay_plan = await this.razorpayClient.plans.create({
      period: dto.razorpayOptions.period ?? 'monthly',
      interval: dto.razorpayOptions.interval ?? 1,
      item: {
        name: dto.name,
        amount: dto.price,
        currency: dto.currency ?? 'INR',
        description: dto.description,
      },
    });
    // Save plan to db
    const plan = await this.prisma.plan.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        days: dto.days,
        razorpay_planId: razorpay_plan.id,
        currency: dto.currency,
      },
    });
    return plan;
  }

  async updatePlan(dto: PlanDto): Promise<any> {
    // Create plan on razorpay
    const razorpay_plan = await this.razorpayClient.plans.create({
      period: dto.razorpayOptions.period ?? 'monthly',
      interval: dto.razorpayOptions.interval ?? 1,
      item: {
        name: dto.name,
        amount: dto.price,
        currency: dto.currency ?? 'INR',
        description: dto.description,
      },
    });
    // Save plan to db
    const plan = await this.prisma.plan.update({
      where: {
        id: dto.planId,
      },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        days: dto.days,
        razorpay_planId: razorpay_plan.id,
        currency: dto.currency,
      },
    });
    return plan;
  }

  async getPlans(): Promise<any> {
    const plans = await this.prisma.plan.findMany();
    return plans;
  }

  async buyPlan(user: User, dto: BuyDto): Promise<any> {
    // Check if user has a page
    const page = await this.prisma.page.findFirstOrThrow({
      where: {
        userId: user.id,
      },
    });

    const plan = await this.prisma.plan.findUnique({
      where: {
        id: dto.planId,
      },
    });

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        status: TransactionStatus.PENDING,
        pageId: page.id,
      },
    });

    // Create razorpay order

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
          status: TransactionStatus.CONFIRMED,
        },
        include: {
          plan: true,
        },
      });

      // If not - Create subscription
      let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;

      // Check for subscription
      const userSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId: transaction.userId,
          status: SubscriptionStatus.ACTIVE,
        },
      });
      // If exists - Add to queue
      if (userSubscription) {
        status = SubscriptionStatus.QUEUED;
      }

      // Add subscription to user
      const subscription = await this.prisma.subscription.create({
        data: {
          userId: transaction.userId,
          pageId: transaction.pageId,
          startsAt: status == SubscriptionStatus.ACTIVE ? new Date() : null,
          endsAt:
            status == SubscriptionStatus.ACTIVE
              ? new Date(new Date().addDays(transaction.plan.days))
              : null,
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
