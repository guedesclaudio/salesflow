import { Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { PrismaService } from '../common';
import { ClientTokensRepository } from './repositories';
import { ClientValidator } from './validators';

@Module({
    providers: [
        Logger,
        ClientValidator,
        ClientTokensRepository,
        PrismaService
    ],
    exports: [
        Logger,
        ClientValidator,
        ClientTokensRepository,
        PrismaService
    ],
    controllers: [

    ],
})
export class ClientModule {}
