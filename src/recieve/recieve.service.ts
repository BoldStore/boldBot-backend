import { Injectable } from '@nestjs/common';
import { GraphService } from 'src/graph/graph.service';
import { Response } from 'src/services/response';
import { UserDto, WebhookType } from 'src/webhook/dto';

@Injectable()
export class RecieveService {
  constructor(private graphService: GraphService) {}

  handleMessage(user: UserDto, webhookEvent: WebhookType) {
    let responses: any;
    try {
      if (webhookEvent.message) {
        const message = webhookEvent.message;
        if (message.is_echo) {
          return;
        } else if (message.quick_reply) {
          responses = this.handleQuickReply(webhookEvent);
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage();
        } else if (message.text) {
          responses = this.handleTextMessage(webhookEvent);
        }
      } else if (webhookEvent.postback) {
        responses = this.handlePostback(webhookEvent);
      } else if (webhookEvent.referral) {
        responses = this.handleReferral(webhookEvent);
      }
    } catch (e) {
      responses = {
        text: `An error has occured: '${e}'. We have been notified and \
        will fix the issue shortly!`,
      };
    }

    if (!responses) {
      return;
    }

    if (Array.isArray(responses)) {
      let delay = 0;
      for (const response of responses) {
        this.sendMessage(response, user.insta_id, delay * 1500);
        delay++;
      }
    } else {
      this.sendMessage(responses, user.insta_id);
    }
  }

  handleQuickReply(webhookEvent: WebhookType) {
    const payload = webhookEvent.message.quick_reply.payload;

    return this.handlePayload(payload);
  }

  handlePostback(webhookEvent: WebhookType) {
    const postback = webhookEvent.postback;

    let payload: string;
    if (postback.referral && postback.referral.type == 'OPEN_THREAD') {
      payload = postback.referral.ref;
    } else {
      payload = postback.payload;
    }
    return this.handlePayload(payload.toUpperCase());
  }

  handleReferral(webhookEvent: WebhookType) {
    const payload = webhookEvent.referral.ref.toUpperCase();

    return this.handlePayload(payload);
  }

  handleAttachmentMessage() {
    const response = Response.genQuickReply('fallback.attachment', [
      {
        title: 'menu.help',
        payload: 'CARE_HELP',
      },
      {
        title: 'menu.start_over',
        payload: 'GET_STARTED',
      },
    ]);

    return response;
  }

  handleTextMessage(webhookEvent: WebhookType) {
    let response = '';
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

    // Greeting
    if (greetings.some((greeting) => message.includes(greeting))) {
      response = '';
    }

    // Help
    if (message.includes('help')) {
      response = '';
    }

    // Fallback
    if (!response) {
      response = '';
    }

    return response;
  }

  handlePayload(payload: string) {
    let response: { text: string }[];
    const user = {};

    // Set the response based on the payload
    if (payload === 'GET_STARTED') {
      response = Response.genNuxMessage(user);
    }
    if (payload.includes('CARE')) {
      const care = 'Help';
      response = Response.genNuxMessage(care);
    }

    return response;
  }

  sendMessage(response: { text: string }, userId: string, delay = 0) {
    // Check if there is delay in the response
    if ('delay' in response) {
      delay = response['delay'];
      delete response['delay'];
    }

    // Construct the message body
    const requestBody = {
      recipient: {
        id: userId,
      },
      message: response,
    };

    // TODO: Get access token
    const access_token = '';

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
