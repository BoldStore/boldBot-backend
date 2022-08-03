import { HttpException, Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { API_URL } from 'src/constants';
import { UserDto } from 'src/webhook/dto';
import { MessageDto } from './dto';

@Injectable()
export class GraphService {
  async sendMessageApi(body: MessageDto, access_token: string) {
    try {
      await axios.post(
        `${API_URL}/me/messages?access_token=${access_token}`,
        body,
      );
    } catch (e) {
      throw new HttpException(e.response.data, e.response.status);
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

  async getUserProfile(insta_id: string) {
    try {
      const url = `${API_URL}/${insta_id}`;
      const response = await axios.get(url, {
        params: {
          access_token: '',
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

  async setIceBreakers(iceBreakers: string[]) {
    try {
      const url = `${API_URL}/me/messenger_profile`;
      const data = {
        platform: 'instagram',
        iceBreakers,
      };

      await axios.post(url, data, {
        params: {
          access_token: '',
        },
      });

      return {
        success: true,
        message: 'Set up ice breakers',
      };
    } catch (e) {
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async setPersistantMenu(persistentMenu: string[]) {
    try {
      const url = `${API_URL}/me/messenger_profile`;
      const data = {
        platform: 'instagram',
        persistentMenu,
      };

      await axios.post(url, data, {
        params: {
          access_token: '',
        },
      });

      return {
        success: true,
        message: 'Set up persistant menu',
      };
    } catch (e) {
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }

  async setPageSubscription() {
    try {
      const pageId = '';
      const url = `${API_URL}/${pageId}/subscribed_apps`;

      await axios.post(url, {
        params: {
          access_token: '',
          subscribed_fields: 'feed',
        },
      });

      return {
        success: true,
        message: 'Page subscriptions have been set',
      };
    } catch (e) {
      throw new HttpException(e?.response?.data, e?.response?.status);
    }
  }
}
