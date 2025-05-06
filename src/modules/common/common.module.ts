import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { Logger } from 'nestjs-pino';
import { ClientTokensRepository } from '../clients/repositories';
import { ClientValidator } from '../clients/validators';
import { HealthController } from './controller';
import { PrismaService } from './provider';
import { DummyResolver } from './resolvers/dummy.resolver';
import { RestrictedGuard } from './security';

@Module({
    imports: [
        TerminusModule
    ],
    providers: [
        Logger,
        PrismaService,
        ClientTokensRepository,
        ClientValidator,
        DummyResolver,
        RestrictedGuard,
    ],
    exports: [
        Logger,
    ],
    controllers: [
        HealthController
    ],
})
export class CommonModule {}
