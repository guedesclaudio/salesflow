import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../provider';
import { HealthGuard } from '../security/health.guard';
import { appRoutes } from '../../app.routes';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(appRoutes.health.main)
@Controller(appRoutes.health.main)
export class HealthController {
    public constructor(
        private readonly health: HealthCheckService,
        private readonly database: PrismaHealthIndicator,
        private readonly prisma: PrismaService
    ) {}

    @Get()
    @UseGuards(HealthGuard)
    public async healthCheck() {
        return this.health.check([
            async () => this.database.pingCheck('database', this.prisma),
            () => ({
                http: {
                    status: 'up',
                    uptime: process.uptime()
                }
            })
        ]);
    }
}
