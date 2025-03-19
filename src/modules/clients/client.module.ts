import { Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { PrismaService } from '../common';
import { ClientValidator } from './validators';
import { ClientTokensRepository } from './repositories';

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
