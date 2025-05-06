import { Injectable } from '@nestjs/common';
import { ClientTokens } from '@prisma/client';
import { ErrorsTypeEnum, throwError } from '../../common/provider/handle-error.provider';
import { ClientTokensRepository } from '../repositories';

@Injectable()
export class ClientValidator {
    constructor(private readonly clientTokensRepository: ClientTokensRepository) {}

    public async checkAccessToken(accessToken: string): Promise<ClientTokens | void> {
        const existingClient = await this.clientTokensRepository.findByAccessToken(accessToken);

        if (!existingClient) return throwError(ErrorsTypeEnum.ClientNotFound);
        return existingClient;
    }

    public async checkId(clientId: string): Promise<ClientTokens | boolean> {
        const existingClient = await this.clientTokensRepository.findByClientId(clientId);

        if (!existingClient) return false;
        return existingClient;
    }
}