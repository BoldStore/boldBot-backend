import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { API_URL } from 'src/constants';
import { MessageDto } from './dto';

@Injectable()
export class GraphService {
  async sendMessage(body: MessageDto, access_token: string) {
    try {
      await axios.post(
        `${API_URL}/me/messages?access_token=${access_token}`,
        body,
      );
    } catch (e) {
      throw new HttpException(e.response.data, e.response.status);
    }
  }
}
