import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { Logger } from 'nestjs-pino';
import { HealthController } from './controller';
// import { LogInterceptor } from './flow';
import { PrismaService } from './provider';

@Module({
    imports: [
        TerminusModule
    ],
    providers: [
        Logger,
        //LogInterceptor,
        PrismaService
    ],
    exports: [
        Logger,
        //LogInterceptor,
        PrismaService
    ],
    controllers: [
        HealthController
    ],
})
export class CommonModule {}
