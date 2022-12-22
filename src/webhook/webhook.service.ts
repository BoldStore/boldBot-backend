import {
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus, TransactionStatus } from '@prisma/client';
import { GraphService } from 'src/graph/graph.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecieveService } from 'src/recieve/recieve.service';
import { WebhookDto } from './dto';
import { RazorpayEvents } from './razorpay.events';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private config: ConfigService,
    private recieveService: RecieveService,
    private graphService: GraphService,
    private prisma: PrismaService,
  ) {}

  verifyWebhook(challenge: string, mode: string, verifyToken: string) {
    if (
      mode === 'subscribe' &&
      verifyToken === this.config.get('WEBHOOK_VERIFY_TOKEN')
    ) {
      return challenge;
    }
    throw new ForbiddenException('Access denied');
  }

  async getWebhook(body: WebhookDto) {
    this.logger.debug('GOT WEBHOOK', body);
    if (body.object === 'page') {
      throw new NotFoundException('Page webhook not implemented');
    }

    for (let i = 0; i < body?.entry?.length; i++) {
      const entry = body.entry[i];
      // Handle Page Changes event
      if ('changes' in entry) {
        if (entry.changes[0].field === 'comments') {
          const change = entry.changes[0].value;
          return this.recieveService.handlePrivateReply(
            'comment_id',
            change.id,
          );
        }
      }
      if (!('messaging' in entry)) {
        console.warn('No messaging field in entry. Possibly a webhook test.');
        return;
      }

      for (const element of entry.messaging) {
        const webhookEvent = element;
        this.logger.debug('EVENT>>', webhookEvent);

        // Eliminate echoes
        if ('message' in webhookEvent && webhookEvent?.message?.is_echo) {
          return;
        }

        // Eliminate read webhooks
        if ('read' in webhookEvent) {
          return;
        }

        const insta_id = webhookEvent?.sender?.id;

        const page_id = entry.id;
        const page = await this.prisma.page.findFirst({
          where: { insta_id: page_id },
        });

        const userProfile = await this.graphService.getUserProfile(
          insta_id,
          page.page_access_token,
        );

        // Unsend webhooks
        if (webhookEvent?.message?.is_deleted) {
          this.recieveService.sendMessage(
            { text: 'Sorry to see that you deleted your message' },
            userProfile?.insta_id,
            page,
          );

          return 'Unsent message';
        }

        await this.recieveService.handleMessage(
          userProfile,
          webhookEvent,
          page,
        );
      }
    }

    return 'Event received';
  }

  async razorpayWebhooks(body: any) {
    try {
      switch (body.event) {
        case RazorpayEvents.CHARGED:
          const r_sub_id = body.payload.subscription.entity.id;
          const pending_transaction =
            await this.prisma.transaction.findFirstOrThrow({
              where: {
                razorpay_sub_id: r_sub_id,
                status: TransactionStatus.PENDING,
              },
            });
          const transaction = await this.prisma.transaction.update({
            where: {
              id: pending_transaction.id,
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
              razorpay_sub_id: transaction.razorpay_sub_id,
              planId: transaction.planId,
            },
          });
          return subscription;

        case RazorpayEvents.CANCELLED:
          // TODO: Implement cancelled handler
          console.log('CANCELLED');
          break;

        case RazorpayEvents.COMPLETED:
          // TODO: Implement completed handler
          console.log('COMPLETED');
          break;

        case RazorpayEvents.HALTED:
          console.log('HALTED');
          break;

        case RazorpayEvents.PENDING:
          console.log('PENDING');
          break;

        default:
          return 'Handler not implemented yet';
      }

      return body;
    } catch (e) {
      this.logger.error('Error in razorpay webhook', e);
      throw new HttpException(e, 500);
    }
  }
}
