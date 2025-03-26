import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { Logger } from 'nestjs-pino';
import { HealthController } from './controller';
import { PrismaService } from './provider';
import { DummyResolver } from './resolvers/dummy.resolver';
import { ClientTokensRepository } from '../clients/repositories';
import { ClientValidator } from '../clients/validators';
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
