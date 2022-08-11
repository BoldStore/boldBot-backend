import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { RecieveModule } from './recieve/recieve.module';
import { GraphModule } from './graph/graph.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app/app.controller';
import { TransactionModule } from './transaction/transaction.module';

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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
