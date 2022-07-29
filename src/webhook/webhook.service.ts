import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebhookDto } from './dto';

@Injectable()
export class WebhookService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

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
    return body;
  }
}
