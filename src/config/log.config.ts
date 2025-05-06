import { LoggerOptions } from 'pino';
import pinoElastic from 'pino-elasticsearch';

export function logConfig(): { pinoHttp: LoggerOptions | any } {
  const streams = [];

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    streams.push({
      stream: pinoElastic({
        index: 'nestjs-logs',
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        'es-version': 7,
      }),
    });
  }

  const isNotProduction = process.env.NODE_ENV !== 'production';
  if (isNotProduction) {
    streams.push({
      stream: require('pino-pretty')({
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      }),
    });
  }

  return {
    pinoHttp: {
      level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
      stream: streams.length === 1 ? streams[0].stream : undefined,
      streams,
    },
  };
}
