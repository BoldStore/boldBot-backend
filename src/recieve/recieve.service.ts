import { Injectable } from '@nestjs/common';
import { GraphService } from 'src/graph/graph.service';
import { UserDto, WebhookType } from 'src/webhook/dto';

@Injectable()
export class RecieveService {
  constructor(private graphService: GraphService) {}

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

  handleMessage(user: UserDto, webhookEvent: WebhookType) {
    let responses: any;
    try {
      if (webhookEvent.message) {
        const message = webhookEvent.message;
        if (message.is_echo) {
          return;
        } else if (message.quick_reply) {
          responses = this.handleQuickReply();
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage();
        } else if (message.text) {
          responses = this.handleTextMessage();
        }
      } else if (webhookEvent.postback) {
        responses = this.handlePostback();
      } else if (webhookEvent.referral) {
        responses = this.handleReferral();
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
        this.sendMessage(response, user.insta_id, delay * 2000);
        delay++;
      }
    } else {
      this.sendMessage(responses, user.insta_id);
    }
  }

  handleQuickReply() {
    return;
  }

  handlePostback() {
    return;
  }

  handleReferral() {
    return;
  }

  handleAttachmentMessage() {
    return;
  }

  handleTextMessage() {
    return;
  }
}
