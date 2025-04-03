import { Sales, SaleStatus } from "@prisma/client";
import { PrismaService } from "../../common";
import { CreateSaleInputSchema } from "../schemas/inputs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SalesRepository {
    constructor(private readonly prisma: PrismaService) {}
    
    public create(data: CreateSaleInputSchema): Promise<Sales> {
        return this.prisma.sales.create({
            data,
        });
    }

    public update(id: string, data: any): Promise<Sales> {
        return this.prisma.sales.update({
            where: {
                id,
                deletedAt: null,
            },
            data,
        });
    }

    public findUniqueByConstraint(authorizationCode: string, saleDate: Date, saleStatusList?: SaleStatus[]) {
        return this.prisma.sales.findFirst({
            where: {
                authorizationCode,
                saleDate,
                saleStatus: {
                    in: saleStatusList
                },
                deletedAt: null
            },
        });
    }

    public findById(saleId: string) {
        return this.prisma.sales.findUnique({
            where: {
                id: saleId,
                deletedAt: null,
            },
        })
    }
}