import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhookDto } from './dto';
import { WebhookService } from './webhook.service';
import { validateWebhookSignature } from 'razorpay';

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

  @HttpCode(HttpStatus.OK)
  @Post('razorpay')
  razorpayWebhooks(@Body() body: any, @Headers() headers) {
    if (
      headers['x-razorpay-signature'] &&
      validateWebhookSignature(
        JSON.stringify(body),
        headers['x-razorpay-signature'],
        process.env.RAZORPAY_WEBHOOK_SECRET,
      )
    ) {
      return this.webhookService.razorpayWebhooks(body);
    } else {
      throw new ForbiddenException('Invalid request');
    }
  }
}
