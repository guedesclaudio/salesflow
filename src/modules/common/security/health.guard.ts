import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable()
export class HealthGuard implements CanActivate {

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        console.log(request.headers.authorization)
        return request.headers.authorization === `Bearer ${process.env.HEALTH_TOKEN}`;
    }
}
