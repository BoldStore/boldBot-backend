import * as winston from 'winston';
import { transports } from './transports';

export const papertrail = new winston.transports.Http({
  host: 'logs.collector.solarwinds.com',
  path: '/v1/log',
  auth: {
    username: process.env.PAPERTRAIL_USER,
    password: process.env.PAPERTRAIL_TOKEN,
  },
  ssl: true,
});

export const logger_config = {
  level: 'silly',
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
    new winston.transports.File({ filename: 'logfile.log' }),
  ],
};
