import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { BuyDto, PlanDto } from './dto';
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

  @Post()
  buyPlan(@GetUser() user: User, @Body() dto: BuyDto) {
    return this.transactionService.buyPlan(user, dto);
  }
}
