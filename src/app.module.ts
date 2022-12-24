import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { WebhookModule } from './webhook/webhook.module';
import { RecieveModule } from './recieve/recieve.module';
import { GraphModule } from './graph/graph.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app/app.controller';
import { TransactionModule } from './transaction/transaction.module';
import { RazorpayModule } from 'nestjs-razorpay';
import { ContactModule } from './contact/contact.module';
import { StatsModule } from './stats/stats.module';
import { logger_config } from './logger.config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    WebhookModule,
    RecieveModule,
    GraphModule,
    AuthModule,
    UserModule,
    MessageModule,
    PrismaModule,
    TransactionModule,
    RazorpayModule.forRoot({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    }),
    WinstonModule.forRoot(logger_config),
    ContactModule,
    StatsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
