import { Injectable } from '@nestjs/common';
import { Sales, SaleStatus } from '@prisma/client';
import { PrismaService } from '../../common';
import { CreateSaleInputSchema } from '../schemas/inputs';

@Injectable()
export class SalesRepository {
    constructor(private readonly prisma: PrismaService) {}

    public async create(data: CreateSaleInputSchema): Promise<Sales> {
        return this.prisma.sales.create({
            data,
        });
    }

    public async update(id: string, data: any): Promise<Sales> {
        return this.prisma.sales.update({
            where: {
                id,
                deletedAt: null,
            },
            data,
        });
    }

    public async findUniqueByConstraint(authorizationCode: string, saleDate: Date, saleStatusList?: SaleStatus[]) {
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

    public async findById(saleId: string) {
        return this.prisma.sales.findUnique({
            where: {
                id: saleId,
                deletedAt: null,
            },
        });
    }
}