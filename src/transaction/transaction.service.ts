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
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId: user.id,
        },
        include: {
          plan: true,
        },
      });

      return transactions;
    } catch (e) {
      throw new HttpException(e, 500);
    }
  }

  async addPlan(dto: PlanDto): Promise<any> {
    try {
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
    } catch (e) {
      throw new HttpException(e, 500);
    }
  }

  async updatePlan(dto: PlanDto): Promise<any> {
    try {
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
    } catch (e) {
      throw new HttpException(e, 500);
    }
  }

  async getPlans(): Promise<any> {
    try {
      const plans = await this.prisma.plan.findMany({
        where: {
          price: {
            gt: 0,
          },
        },
      });
      return plans;
    } catch (e) {
      throw new HttpException(e, 500);
    }
  }

  async buyPlan(user: User, dto: BuyDto): Promise<any> {
    try {
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

      // Create subscription
      // Check if subscription already there
      // If yes
      // Cancel Subscription from razorpay
      // Then create a new subscription
      const subscription = await this.prisma.subscription.findFirst({
        where: {
          pageId: page.id,
          OR: [
            {
              status: SubscriptionStatus.ACTIVE,
            },
            {
              status: SubscriptionStatus.QUEUED,
            },
          ],
        },
      });

      if (subscription) {
        await this.razorpayClient.subscriptions.cancel(
          subscription.razorpay_sub_id,
        );
      }

      const razorpay_sub = await this.razorpayClient.subscriptions.create({
        plan_id: plan.razorpay_planId,
        total_count: 12,
      });

      // Create transaction
      const transaction = await this.prisma.transaction.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amount: plan.price,
          status: TransactionStatus.PENDING,
          pageId: page.id,
          razorpay_sub_id: razorpay_sub.id,
        },
      });

      return { transaction, razorpay_sub };
    } catch (e) {
      console.log(e);
      throw new HttpException('Unable to buy plan', 500);
    }
  }
}
