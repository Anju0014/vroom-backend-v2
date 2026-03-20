import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'vroom-backend' },
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '5d',
      zippedArchive: true,
      auditFile: 'logs/audit-error.json',
    }),

    new DailyRotateFile({
      filename: 'logs/%DATE%-combined.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '3d',
      zippedArchive: true,
      auditFile: 'logs/audit-combined.json',
    }),
  ],
});

export default logger;
