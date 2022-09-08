import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';

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
import { transports } from './transports';

const papertrail = new winston.transports.Http({
  host: 'logs.collector.solarwinds.com',
  path: '/v1/log',
  auth: { username: '', password: 'TOKEN' },
  ssl: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WebhookModule,
    RecieveModule,
    GraphModule,
    AuthModule,
    UserModule,
    MessageModule,
    PrismaModule,
    TransactionModule,
    RazorpayModule.forRoot({
      key_id: 'razorpay_key_id',
      key_secret: 'razorpay_key_secret',
    }),
    WinstonModule.forRoot({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports: [
        transports.console,
        papertrail,
        // new winston.transports.Console({
        //   format: winston.format.combine(
        //     winston.format.timestamp(),
        //     winston.format.ms(),
        //     nestWinstonModuleUtilities.format.nestLike('BOLDbot', {
        //       prettyPrint: true,
        //       colors: true,
        //     }),
        //   ),
        // }),
        new winston.transports.File({ filename: 'logfile.log' }),
      ],
    }),
    ContactModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
