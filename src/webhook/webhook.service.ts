import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecieveService } from 'src/recieve/recieve.service';
import { WebhookDto } from './dto';

@Injectable()
export class WebhookService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private recieveService: RecieveService,
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

  getWebhook(body: WebhookDto) {
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

      for (let i = 0; i < entry.messaging.length; i++) {
        const webhookEvent = entry.messaging[i];

        if ('message' in webhookEvent && webhookEvent?.message?.is_echo) {
          return;
        }

        const insta_id = webhookEvent?.sender?.id;

        this.recieveService.handleMessage(insta_id, webhookEvent);
      }
    }

    return 'Event received';
  }
}
