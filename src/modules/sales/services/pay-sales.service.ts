import { Injectable } from '@nestjs/common';
import { Sales, SaleStatus } from '@prisma/client';
import { PaySalesProducer } from '../queues/producers';
import { SalesRepository } from '../repositories';
import { PaySaleInputSchema } from '../schemas/inputs';
import { SalesValidator } from '../validators';

@Injectable()
export class PaySalesService {
    constructor(
        private readonly salesProducer: PaySalesProducer,
        private readonly salesRepository: SalesRepository,
        private readonly salesValidator: SalesValidator,
    ) {}

    public async enqueue(paySalesDto: PaySaleInputSchema): Promise<Boolean> {
        const { clientId, saleId } = paySalesDto;
        await this.salesValidator.checkSaleByIdAndClientId(saleId, clientId);
        await this.salesProducer.enqueueNewSale(paySalesDto);
        return true;
    }

    public async processPayment(paySalesDto: PaySaleInputSchema): Promise<Sales> {
        const data = {
            saleStatus: SaleStatus.PROCESSED,
            log: 'Sale paid successfully',
        };
        return this.salesRepository.update(paySalesDto.saleId, data);
    }
}