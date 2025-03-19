import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common";
import { ActivityStatus } from "@prisma/client";

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
}