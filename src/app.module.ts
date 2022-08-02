import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { RecieveModule } from './recieve/recieve.module';
import { GraphModule } from './graph/graph.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WebhookModule,
    RecieveModule,
    GraphModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
