import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { LogService } from '../utils';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logService: LogService) {
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
      this.logService.log().Prisma.Query({
        type: 'query',
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      });
    });

    this.$on('info' as never, (e: Prisma.LogEvent) => {
      this.logService.log().Prisma.Info({ type: 'info', message: e.message });
    });

    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logService.log().Prisma.Warn({ type: 'warn', message: e.message });
    });

    this.$on('error' as never, (e: Prisma.LogEvent) => {
      this.logService.log().Prisma.Error({ type: 'error', message: e.message });
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logService.log().Prisma.Connected();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logService.log().Prisma.Disconnected();
  }
}
