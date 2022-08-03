import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { RecieveModule } from './recieve/recieve.module';
import { GraphModule } from './graph/graph.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { FirebaseAdminModule } from '@tfarras/nestjs-firebase-admin';
import * as admin from 'firebase-admin';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseAdminModule.forRootAsync({
      useFactory: () => ({
        credential: admin.credential.cert('src/bold-firebase.json'),
      }),
    }),
    WebhookModule,
    RecieveModule,
    GraphModule,
    AuthModule,
    UserModule,
    MessageModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
