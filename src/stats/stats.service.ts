import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class StatsService {
  async getStats(user: User, page_id: string) {
    // TODO: Get greetings
    // TODO: Get ice-breakers
    // TODO: Get persistent-menu
    // TODO: Get story replies
    // TODO: Get story mentions
    return {
      user,
      page_id,
    };
  }
}
