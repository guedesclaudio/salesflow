import { Injectable } from "@nestjs/common";
import { ActivityStatus } from "@prisma/client";
import { PrismaService } from "../../common/provider/prisma.provider";

@Injectable()
export class ClientTokensRepository {
    constructor(private readonly prisma: PrismaService) {}

    public findByAccessToken(accessToken: string) {
        return this.prisma.clientTokens.findFirst({
            where: {
                accessToken,
                activityStatus: ActivityStatus.ACTIVE,
                deletedAt: null,
            },
        });
    }

    public findByClientId(clientId: string) {
        return this.prisma.clientTokens.findFirst({
            where: {
                clientId,
                deletedAt: null,
            },
        });
    }
}