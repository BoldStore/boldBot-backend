import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  getTransactions(@GetUser() user: User) {
    return this.transactionService.getTransactions(user);
  }

  @Get()
  addSubscription() {
    return this.transactionService.addSubscription();
  }

  @Get()
  getPlans() {
    return this.transactionService.getPlans();
  }

  @Post()
  buyPlan(@GetUser() user: User) {
    return this.transactionService.buyPlan(user);
  }
}
