import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Role } from '../../tokens';
import { extractTokenPayload } from './security-utils';
import { ClientValidator } from '../../clients/validators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RestrictedGuard implements CanActivate {
    constructor(private readonly clientValidator: ClientValidator) {}

    public async canActivate(context: any): Promise<boolean> {
        let request: FastifyRequest | undefined;

        if (context.getType() === 'http') {
            request = (context as ExecutionContext).switchToHttp().getRequest<FastifyRequest>();
        }

        if (context.getType() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context);
            request = gqlContext.getContext().req;
        }

        const payload = extractTokenPayload(request as any);
        if (!payload) return false;
        
        const isRestricted = (payload.role === Role.RESTRICTED);
        if (!isRestricted) return false;

        const existingClient = await this.clientValidator.checkId(payload.clientId);
        if (!existingClient) return false;

        return true;
    }
}
