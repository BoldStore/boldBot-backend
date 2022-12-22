import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { UserGuard } from 'src/auth/guard';
import { BuyDto, PlanDto } from './dto';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(UserGuard)
  @Get()
  getTransactions(@GetUser() user: User) {
    return this.transactionService.getTransactions(user);
  }

  @UseGuards(UserGuard)
  @Post()
  buyPlan(@GetUser() user: User, @Body() dto: BuyDto) {
    return this.transactionService.buyPlan(user, dto);
  }

  // TODO: Validate if admin
  @Post('plan')
  addPlan(@Body() dto: PlanDto) {
    return this.transactionService.addPlan(dto);
  }

  @Put('plan')
  updatePlan(@Body() dto: PlanDto) {
    return this.transactionService.updatePlan(dto);
  }

  @Get('plan')
  getPlans() {
    return this.transactionService.getPlans();
  }
}
