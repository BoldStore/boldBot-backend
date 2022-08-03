import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphService } from 'src/graph/graph.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecieveService } from 'src/recieve/recieve.service';
import { WebhookDto } from './dto';

@Injectable()
export class WebhookService {
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

        const userProfile = await this.graphService.getUserProfile(insta_id);

        const page_id = entry.id;
        const page = await this.prisma.page.findFirst({
          where: { page_id: page_id },
        });

        this.recieveService.handleMessage(userProfile, webhookEvent, page);
      }
    }

    return 'Event received';
  }
}
