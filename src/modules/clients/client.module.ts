import { Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { PrismaService } from '../common';
import { LogService } from '../common/utils';
import { ClientTokensRepository } from './repositories';
import { ClientValidator } from './validators';

@Module({
  providers: [Logger, ClientValidator, ClientTokensRepository, LogService, PrismaService],
  exports: [Logger, ClientValidator, ClientTokensRepository, LogService, PrismaService],
  controllers: [],
})
export class ClientModule {}
