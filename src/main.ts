import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
  WINSTON_MODULE_NEST_PROVIDER,
} from 'nest-winston';

declare global {
  interface Date {
    addDays(days: number): Date;
  }
}

Date.prototype.addDays = function (days) {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    // logger: ['error', 'warn', 'log'],
    logger: WinstonModule.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('BOLDbot', {
              prettyPrint: true,
              colors: true,
            }),
          ),
        }),
        new winston.transports.File({ filename: 'logfile.log' }),
      ],
    }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });

  app.enableCors();
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(3001);
}
bootstrap();
