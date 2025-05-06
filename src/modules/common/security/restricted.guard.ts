import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyRequest } from 'fastify';
import { ClientValidator } from '../../clients/validators';
import { Role } from '../../tokens';
import { extractTokenPayload } from './security-utils';

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

    const isRestricted = payload.role === Role.RESTRICTED;
    if (!isRestricted) return false;

    const existingClient = await this.clientValidator.checkId(payload.clientId);
    if (!existingClient) return false;

    (request as any).clientId = payload.clientId;

    return true;
  }
}
