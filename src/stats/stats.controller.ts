import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { UserGuard } from 'src/auth/guard';
import { StatsService } from './stats.service';

@UseGuards(UserGuard)
@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private statService: StatsService) {}

  @Get('')
  getStats(@GetUser() user: User, @Query('page') page_id: string) {
    return this.statService.getStats(user, page_id);
  }
}
