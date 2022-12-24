import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { SubscriptionStatus, User } from '@prisma/client';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LimitRepliesInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const pageId = request.body.pageId;
    console.log('REQ user>>', request.user);

    // Replies
    const used = await this.prisma.messageCount.groupBy({
      by: ['serviceName'],
      where: {
        pageId,
        userId: user.id,
      },
      _count: true,
    });
    console.log(used);

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        pageId: pageId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    const plan = await this.prisma.plan.findFirst({
      where: {
        id: subscription.planId,
      },
      include: {
        services: true,
      },
    });

    // Validate limit
    console.log(plan);

    return next.handle();
  }
}
