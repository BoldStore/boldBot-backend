import { Injectable } from '@nestjs/common';
import { GraphService } from 'src/graph/graph.service';

@Injectable()
export class RecieveService {
  constructor(private graphService: GraphService) {}

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

    return this.graphService.sendMessage(body, access_token);
  }
}
