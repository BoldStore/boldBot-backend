import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Page } from '@prisma/client';
import { GraphService } from 'src/graph/graph.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto, WebhookType } from 'src/webhook/dto';
import { MessageTypes } from './message.type';
import { RecieveHelpers } from './recieve.helpers';

@Injectable()
export class RecieveService {
  private readonly logger = new Logger(RecieveService.name);
  constructor(
    private graphService: GraphService,
    private prisma: PrismaService,
    private helper: RecieveHelpers,
  ) {}

  async handleMessage(user: UserDto, webhookEvent: WebhookType, page: Page) {
    this.logger.debug('PAGE>>>', page);
    let responses: any;
    const message = webhookEvent.message;
    try {
      if (webhookEvent.message) {
        if (message.is_echo) {
          return;
        } else if (message.quick_reply) {
          responses = this.handleQuickReply(webhookEvent);
        } else if (message.attachments) {
          responses = await this.handleAttachmentMessage(
            webhookEvent,
            page,
            user,
          );
        } else if (message.text) {
          responses = await this.handleTextMessage(webhookEvent, page, user);
        }
      } else if (webhookEvent.postback) {
        responses = await this.handlePostback(webhookEvent, page, user);
      } else if (webhookEvent.referral) {
        responses = this.handleReferral(webhookEvent);
      }
    } catch (e) {
      // responses = {
      //   text: `An error has occured: '${e}'. We have been notified and \
      //   will fix the issue shortly!`,
      // };
    }

    if (!responses) {
      return;
    }

    if (Array.isArray(responses)) {
      let delay = 0;
      for (const response of responses) {
        this.sendMessage(response, user?.insta_id, page, delay * 1500);
        delay++;
      }
    } else {
      this.sendMessage(responses, user?.insta_id, page);
    }
  }

  handleQuickReply(webhookEvent: WebhookType) {
    const payload = webhookEvent.message.quick_reply.payload;

    return this.handlePayload(payload);
  }

  async handlePostback(webhookEvent: WebhookType, page: Page, user: UserDto) {
    try {
      const postback = webhookEvent.postback;

      const isAvailable = await this.helper.validateLimit(
        page,
        webhookEvent.postback.payload,
      );

      if (!isAvailable) {
        await this.helper.addCount(
          page.userId,
          webhookEvent.postback.payload,
          user,
          true,
        );
        throw new HttpException('Limit Reached', 400);
      }

      // Get message
      const message = await this.prisma.message.findFirst({
        where: {
          type: webhookEvent.postback.payload,
          pageId: page.id,
          question: postback.title,
        },
        include: {
          texts: true,
        },
      });

      // Add count
      await this.helper.addCount(
        page.userId,
        webhookEvent.postback.payload,
        user,
      );

      const response = [];
      message.texts.forEach((text) => {
        response.push({ text: text.value });
      });
      return response;
    } catch (e) {
      this.logger.debug('ERROR>>>', e);
      throw new HttpException('There was an error', 500);
    }
  }

  handleReferral(webhookEvent: WebhookType) {
    const payload = webhookEvent.referral.ref.toUpperCase();

    return this.handlePayload(payload);
  }

  async handleAttachmentMessage(
    webhookEvent: WebhookType,
    page: Page,
    user: UserDto,
  ) {
    const attachment = webhookEvent.message.attachments;
    let response: any;

    // Story mentions
    if (
      attachment.length > 0 &&
      attachment[0].type == MessageTypes.STORY_MENTION
    ) {
      const isAvailable = await this.helper.validateLimit(
        page,
        MessageTypes.STORY_MENTION,
      );

      if (!isAvailable) {
        await this.helper.addCount(
          page.userId,
          MessageTypes.STORY_MENTION,
          user,
          true,
        );
        throw new HttpException('Limit Reached', 400);
      }
      const reply = await this.prisma.message.findFirst({
        where: {
          userId: page.userId,
          pageId: page.id,
          type: MessageTypes.STORY_MENTION,
        },
        include: {
          texts: true,
        },
      });

      if (reply?.texts?.length > 0) {
        const arr = [];
        reply?.texts?.forEach((text) => {
          if (text.key !== 'fallback') {
            arr.push({
              text: text.value,
            });
          }
        });
        response = arr;
      } else {
        response = reply.texts[0].value;
      }

      // Add count
      await this.helper.addCount(page.userId, MessageTypes.STORY_MENTION, user);
    }
    return response;
  }

  async handleTextMessage(
    webhookEvent: WebhookType,
    page: Page,
    user: UserDto,
  ) {
    let response: any;
    const message = webhookEvent.message.text.trim().toLowerCase();

    const greetings = [
      'hi',
      'hello',
      'hey',
      'hola',
      'bonjour',
      'greetings',
      'start over',
      'get started',
    ];

    // Handle story reply
    if (webhookEvent?.message?.reply_to?.story) {
      const isAvailable = await this.helper.validateLimit(
        page,
        MessageTypes.STORY_REPLY,
      );

      if (!isAvailable) {
        await this.helper.addCount(
          page.userId,
          MessageTypes.STORY_REPLY,
          user,
          true,
        );
        throw new HttpException('Limit Reached', 400);
      }
      const replyText = webhookEvent.message.text;

      const reply = await this.prisma.message.findFirst({
        where: {
          userId: page.userId,
          pageId: page.id,
          question: replyText,
          type: MessageTypes.STORY_REPLY,
        },
        include: {
          texts: true,
        },
      });

      if (reply?.texts?.length > 0) {
        const arr = [];
        reply?.texts?.forEach((text) => {
          if (text.key !== 'fallback') {
            arr.push({
              text: text.value,
            });
          }
        });
        response = arr;
      } else {
        response = reply.texts[0].value;
      }

      // Add count
      await this.helper.addCount(page.userId, MessageTypes.STORY_REPLY, user);
    }

    // To handle exclamations and words
    message.replace('!', ' ');
    const message_split = message.split(' ');

    // Greeting
    if (
      !response &&
      greetings.some((greeting) => message_split.includes(greeting))
    ) {
      const isAvailable = await this.helper.validateLimit(
        page,
        MessageTypes.GREETING,
      );

      if (!isAvailable) {
        await this.helper.addCount(
          page.userId,
          MessageTypes.GREETING,
          user,
          true,
        );
        throw new HttpException('Limit Reached', 400);
      }
      // Get greeting
      const message = await this.prisma.message.findFirst({
        where: {
          type: MessageTypes.GREETING,
          pageId: page.id,
        },
        include: {
          texts: true,
        },
      });

      // Add count
      await this.helper.addCount(page.userId, MessageTypes.GREETING, user);

      if (message?.texts?.length > 0) {
        const arr = [];
        message?.texts?.forEach((text) => {
          if (text.key !== 'fallback') {
            arr.push({
              text: text.value,
            });
          }
        });
        response = arr;
      } else {
        response = message.texts[0].value;
      }
    }

    // Live Agent
    if (!response && message.includes('live agent')) {
      response = {
        text: 'Okay, transferring you to a live agent now. I will reply to you personally',
      };
    }

    // Fallback
    if (!response) {
      // const message = await this.prisma.message.findFirst({
      //   where: {
      //     type: 'greeting',
      //     pageId: page.id,
      //     texts: {
      //       some: {
      //         key: 'fallback',
      //       },
      //     },
      //   },
      //   include: {
      //     texts: true,
      //   },
      // });
      // response = message.texts[0].value;
      response = '';
    }

    return response;
  }

  handlePayload(payload: string) {
    let response: { text: string }[];

    // Set the response based on the payload
    if (payload === 'GET_STARTED') {
      // response = Response.genNuxMessage(user);
    }
    if (payload.includes('CARE')) {
      // response = Response.genNuxMessage(care);
    }

    return response;
  }

  sendMessage(
    response: { text: string },
    userId: string,
    page: Page,
    delay = 0,
  ) {
    // Check if there is delay in the response
    if ('delay' in response) {
      delay = response['delay'] as number;
      delete response['delay'];
    }

    // Construct the message body
    const requestBody = {
      recipient: {
        id: userId,
      },
      message: response,
    };

    const access_token = page.page_access_token;

    setTimeout(
      () => this.graphService.sendMessageApi(requestBody, access_token),
      delay,
    );
  }

  handlePrivateReply(type: string, object_id: string) {
    const access_token = '';
    const body = {
      recipient: {
        [type]: object_id,
      },
      message: {
        text: 'Hello World!',
      },
      tag: 'HUMAN_AGENT',
    };

    return this.graphService.sendMessageApi(body, access_token);
  }
}
