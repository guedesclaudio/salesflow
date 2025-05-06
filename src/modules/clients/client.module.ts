import { Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { PrismaService } from '../common';
import { ClientTokensRepository } from './repositories';
import { ClientValidator } from './validators';
import { LogService } from '../common/utils';

@Module({
    providers: [
        Logger,
        ClientValidator,
        ClientTokensRepository,
        LogService,
        PrismaService
    ],
    exports: [
        Logger,
        ClientValidator,
        ClientTokensRepository,
        LogService,
        PrismaService
    ],
    controllers: [

    ],
})
export class ClientModule {}
