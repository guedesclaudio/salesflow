import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { Logger } from 'nestjs-pino';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: Logger) {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    this.setupLogging();
  }

  private setupLogging() {
    this.$on('query' as never, (e: Prisma.QueryEvent) => {
      this.logger.log({
        type: 'query',
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      });
    });

    this.$on('info' as never, (e: Prisma.LogEvent) => {
      this.logger.log({ type: 'info', message: e.message });
    });

    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logger.warn({ type: 'warn', message: e.message });
    });

    this.$on('error' as never, (e: Prisma.LogEvent) => {
      this.logger.error({ type: 'error', message: e.message });
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Desconnected Prisma');
  }
}
