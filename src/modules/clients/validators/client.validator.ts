import { Injectable } from "@nestjs/common";
import { ClientTokensRepository } from "../repositories";
import { ClientTokens } from "@prisma/client";
import { ErrorsTypeEnum, throwError } from "../../common/provider/handle-error.provider";

@Injectable()
export class ClientValidator {
    constructor(private readonly clientTokensRepository: ClientTokensRepository) {}

    public async checkAccessToken(accessToken: string): Promise<ClientTokens | void> {
        const existingClient = await this.clientTokensRepository.findByAccessToken(accessToken);
        
        if (!existingClient) return throwError(ErrorsTypeEnum.ClientNotFound);
        return existingClient;
    }
}