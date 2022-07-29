import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum Fields {
  comments = 'comments',
}

export type WebhookType = {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{
      type: string;
      payload: {
        url: string;
        title: string;
        description: string;
        image_url: string;
        buttons: Array<{
          url: string;
        }>;
      };
    }>;
    is_deleted?: boolean;
    is_echo?: boolean;
    is_unsupported?: boolean;
    reply_to?: {
      mid: string;
      story?: {
        id: string;
        url: string;
      };
    };
    quick_reply?: {
      payload: string;
    };
  };
  reaction?: {
    mid: string;
    action: string;
    reaction: string;
    emoji: string;
  };
  postback?: {
    mid: string;
    title: string;
    payload: string;
  };
  referral?: {
    product: {
      id: string;
    };
  };
};

export class WebhookDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(['instagram', 'page'])
  object: string;

  @IsArray()
  entry: Array<{
    id: string;
    time: number;
    changes?: Array<{
      id: string;
      field: Fields;
      value: {
        id: string;
        text: string;
      };
    }>;
    messaging?: Array<WebhookType>;
  }>;
}
