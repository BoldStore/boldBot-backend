import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    switch (body.event) {
      case RazorpayEvents.CHARGED:
        console.log('CHARGED');
        break;

      case RazorpayEvents.ACTIVATED:
        console.log('ACTIVATED');
        break;

      case RazorpayEvents.CANCELLED:
        console.log('CANCELLED');
        break;

      case RazorpayEvents.COMPLETED:
        console.log('COMPLETED');
        break;

      case RazorpayEvents.HALTED:
        console.log('HALTED');
        break;

      case RazorpayEvents.PENDING:
        console.log('PENDING');
        break;
    }

    return body;
  }
}
