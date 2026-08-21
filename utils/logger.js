import pino from 'pino';
import settings from '../settings.js';

export const logger = pino({
  level: settings?.logLevel || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'
    }
  }
});

export default logger;
