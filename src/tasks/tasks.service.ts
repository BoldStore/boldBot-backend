import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GraphService } from 'src/graph/graph.service';
import { PrismaService } from 'src/prisma/prisma.service';

// TODO: Maybe optimized
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private graphService: GraphService,
  ) {}
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async handleCron() {
    this.logger.debug('Running Cron for long lived access token');
    // Get all pages
    const pages = await this.prisma.page.findMany();
    // for each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      // update token
      const data = await this.graphService.getLongLivedToken(
        page.page_access_token,
      );
      const access_token = data.access_token;
      await this.prisma.page.update({
        where: {
          id: page.id,
        },
        data: {
          page_access_token: access_token,
        },
      });
    }
  }
}
