import winston from 'winston';

const isTest = process.env.NODE_ENV === 'test';

// const host = process.env.ELK_HOST || 'localhost';

const format = winston.format.combine(
  winston.format((info) => ({ ...info, level: info.level }))(),
  winston.format.align(),
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.prettyPrint(),
  winston.format.simple(),
  winston.format.splat(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[ ${level} ] ${timestamp}: ${message}`;
  }),
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.cli({
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        http: 'green',
        verbose: 'cyan',
        debug: 'white',
      },
    }),
    format,
  ),
  handleExceptions: true,
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isTest ? 'warn' : 'info'),
  transports: [consoleTransport],
});

logger.on('error', (error) => {
  console.error('Error in logger caught', error);
});
