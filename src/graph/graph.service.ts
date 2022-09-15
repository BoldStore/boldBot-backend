import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Message } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import {
  API_URL,
  CLIENT_ID,
  GRANT_TYPE,
  WEBHOOK_PERMISSIONS,
} from 'src/constants';
import { WebData } from 'src/message/dto';
import { UserDto } from 'src/webhook/dto';
import { MessageDto } from './dto';

@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);

  async sendMessageApi(body: MessageDto, access_token: string) {
    try {
      this.logger.debug('BODY>>', body);
      await axios.post(
        `${API_URL}/me/messages?access_token=${access_token}`,
        body,
      );
    } catch (e) {
      this.logger.debug(e?.response?.data ?? e);
      throw new HttpException(
        e?.response?.data ?? e ?? '',
        e?.response?.status ?? 500,
      );
    }
  }

  async getUserId(access_token: string): Promise<{ name: string; id: string }> {
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/me?access_token=${access_token}`,
      );
      return response.data;
    } catch (e) {
      throw new HttpException(e.response.data, e.response.status);
    }
  }

  async getPagePic(page_id: string) {
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/${page_id}/picture?redirect=0`,
      );
      return response.data?.data?.url;
    } catch (e) {
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async getPageData(user_id: string, access_token: string) {
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/${user_id}/accounts?access_token=${access_token}`,
      );
      return response?.data?.data[0];
    } catch (e) {
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async getInstaId(pageId: string, access_token: string) {
    try {
      const response: AxiosResponse = await axios.get(
        `${API_URL}/${pageId}?fields=instagram_business_account&access_token=${access_token}`,
      );
      this.logger.debug('GET INSTA ID RES>>', response.data);
      return response?.data?.instagram_business_account ?? response?.data;
    } catch (e) {
      this.logger.debug('ERROR', e?.response?.data);
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async getUserProfile(insta_id: string, access_token: string, pic = 0) {
    try {
      let fields = 'name,username';
      switch (pic) {
        case 0:
          fields = 'name,username,profile_pic';
          break;
        case 1:
          fields = 'name,username,profile_picture_url';
          break;
        case 2:
          fields = 'name,username,picture';
          break;
        default:
          fields = 'name,username';
      }
      const url = `${API_URL}/${insta_id}`;
      const response = await axios.get(url, {
        params: {
          access_token: access_token,
          fields: fields,
        },
      });

      const user: UserDto = {
        name: response?.data?.name,
        profilePic:
          response?.data?.profile_picture_url ??
          response?.data?.picture?.data?.url,
        username: response?.data?.username,
        insta_id,
      };

      return user;
    } catch (e) {
      if (e.response.data.error.code === 100 && pic < 3) {
        const picNumber = pic + 1;
        return await this.getUserProfile(insta_id, access_token, picNumber);
      } else {
        throw new HttpException(e?.response?.data, e?.response?.status);
      }
    }
  }

  async setIceBreakers(iceBreakers: Message[], access_token: string) {
    try {
      const url = `${API_URL}/me/messenger_profile`;
      const data = {
        platform: 'instagram',
        ice_breakers: iceBreakers.map((iceBreaker) => {
          if (iceBreaker.question)
            return {
              question: iceBreaker?.question,
              payload: 'ice-breaker',
            };
        }),
      };

      await axios.post(url, data, {
        params: {
          access_token: access_token,
        },
      });

      return {
        success: true,
        message: 'Set up ice breakers',
      };
    } catch (e) {
      this.logger.debug(
        'SETTING UP ICE BREAKER ERROR: ',
        e?.response?.data ?? e,
      );
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async setPersistentMenu(
    persistentMenu: string[],
    access_token: string,
    web_data?: WebData,
  ) {
    try {
      const items = [];
      persistentMenu.forEach((item) => {
        if (item)
          items.push({
            type: 'postback',
            title: item.toString(),
            payload: 'persistent-menu',
          });
      });

      const url = `${API_URL}/me/messenger_profile`;
      let data = null;

      if (items.length < 0) return;

      if (web_data && web_data?.title) {
        data = {
          persistent_menu: [
            {
              locale: 'default',
              composer_input_disabled: false,
              call_to_actions: [
                ...items,
                {
                  type: 'web_url',
                  title: web_data?.title,
                  url: web_data?.url,
                  webview_height_ratio: 'full',
                },
              ],
            },
          ],
        };
      } else {
        data = {
          persistent_menu: [
            {
              locale: 'default',
              composer_input_disabled: false,
              call_to_actions: items,
            },
          ],
        };
      }

      await axios.post(
        url + `?platform=instagram&access_token=${access_token}`,
        data,
      );

      return {
        success: true,
        message: 'Set up persistant menu',
      };
    } catch (e) {
      this.logger.debug(
        'ERROR IN SETTING PERSISTENT MENU>>',
        e?.response?.data ?? e,
      );
      if (e?.response?.data?.error?.code == 100) {
        throw new HttpException('Link should be a URL', e?.response?.status);
      } else {
        throw new HttpException('Something went wrong', e?.response?.status);
      }
    }
  }

  async setPageSubscription(pageId: string, access_token: string) {
    try {
      const url = `${API_URL}/${pageId}/subscribed_apps?subscribed_fields=${WEBHOOK_PERMISSIONS}&access_token=${access_token}`;
      this.logger.debug('MESSAGES URL>>>>', url);

      const response = await axios.post(url, {
        // params: {
        //   access_token: access_token,
        //   subscribed_fields: 'feed',
        // },
      });

      this.logger.debug(response.data);

      return {
        success: true,
        message: 'Page subscriptions have been set',
      };
    } catch (e) {
      this.logger.debug('ERROR SUBSCRIPTION>>', e?.response?.data);
      // throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async getLongLivedToken(access_token: string) {
    try {
      const url = `${API_URL}/oauth/access_token?grant_type=${GRANT_TYPE}&client_id=${CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&fb_exchange_token=${access_token}`;

      const response = await axios.get(url);

      return {
        success: true,
        access_token: response.data.access_token,
      };
    } catch (e) {
      this.logger.debug('ERROR LONG LIVED ACCESS TOKEN>>', e?.response?.data);
    }
  }
}
