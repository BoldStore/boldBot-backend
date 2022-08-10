import { HttpException, Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from 'src/constants';
import { WebData } from 'src/message/dto';
import { UserDto } from 'src/webhook/dto';
import { MessageDto } from './dto';

@Injectable()
export class GraphService {
  async sendMessageApi(body: MessageDto, access_token: string) {
    try {
      console.log('BODY>>', body);
      await axios.post(
        `${API_URL}/me/messages?access_token=${access_token}`,
        body,
      );
    } catch (e) {
      console.log(e?.response?.data ?? e);
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
      return response?.data?.instagram_business_account;
    } catch (e) {
      console.log('ERROR', e?.response?.data);
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async getUserProfile(insta_id: string, access_token: string) {
    try {
      const url = `${API_URL}/${insta_id}`;
      const response = await axios.get(url, {
        params: {
          access_token: access_token,
          fields: 'name,profile_pic',
        },
      });

      const user: UserDto = {
        name: response?.data?.name,
        profilePic: response?.data?.profile_pic,
        insta_id,
      };

      return user;
    } catch (e) {
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async setIceBreakers(iceBreakers: Message[], access_token: string) {
    try {
      const url = `${API_URL}/me/messenger_profile`;
      const data = {
        platform: 'instagram',
        ice_breakers: iceBreakers.forEach((iceBreaker) => {
          return {
            call_to_actions: [
              {
                type: iceBreaker?.question,
                payload: iceBreaker?.id,
              },
            ],
            locale: 'default',
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
      console.log('SETTING UP ICE BREAKER ERROR: ', e?.response?.data ?? e);
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async setPersistentMenu(
    persistentMenu: string[],
    access_token: string,
    web_data?: WebData,
  ) {
    try {
      const url = `${API_URL}/me/messenger_profile`;
      const data = {
        persistentMenu: [
          {
            locale: 'default',
            composer_input_disabled: false,
            call_to_actions: [
              ...persistentMenu.map((item) => {
                return {
                  type: 'postback',
                  title: item,
                  payload: 'text',
                };
              }),
              web_data.url && {
                type: 'web_url',
                title: web_data.title,
                url: web_data.url,
                webview_height_ratio: 'full',
              },
            ],
          },
        ],
      };

      await axios.post(url, data, {
        params: {
          platform: 'instagram',
          access_token,
        },
      });

      return {
        success: true,
        message: 'Set up persistant menu',
      };
    } catch (e) {
      console.log('ERROR IN SETTING PERSISTENT MENU>>', e?.response?.data ?? e);
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async setPageSubscription(pageId: string, access_token: string) {
    try {
      const url = `${API_URL}/${pageId}/subscribed_apps?subscribed_fields=feed&access_token=${access_token}`;

      const response = await axios.post(url, {
        // params: {
        //   access_token: access_token,
        //   subscribed_fields: 'feed',
        // },
      });

      console.log(response.data);

      return {
        success: true,
        message: 'Page subscriptions have been set',
      };
    } catch (e) {
      console.log('ERROR SUBSCRIPTION>>', e?.response?.data);
      // throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }
}
