import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhookDto } from './dto';
import { WebhookService } from './webhook.service';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  verifyWebhook(
    @Query('hub.challenge') challenge: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
  ) {
    return this.webhookService.verifyWebhook(challenge, mode, verifyToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  getWebhook(@Body() dto: WebhookDto) {
    return this.webhookService.getWebhook(dto);
  }
}
