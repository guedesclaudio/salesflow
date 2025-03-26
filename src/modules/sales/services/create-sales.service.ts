import { Injectable } from "@nestjs/common";
import { SaleStatus } from "@prisma/client";
import { SaleOutputSchema } from "../schemas/outputs";
import { CreateSaleInputSchema } from "../schemas/inputs";
import { SalesProducer } from "../queues/producers";

@Injectable()
export class CreateSalesService {
    constructor(
        private readonly salesProducer: SalesProducer,
    ) {}

    public async create(createSalesDto: CreateSaleInputSchema): Promise<SaleOutputSchema> {
        await this.salesProducer.enqueueNewSale(createSalesDto);
        return {
            id: 0,
            authorizationCode: "string;",
            clientId: 1,
            saleStatus: SaleStatus.PENDING,
            value: 1,
            userCode: "string;",
            saleDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
        }
    }
}