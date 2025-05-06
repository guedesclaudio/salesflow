import { Injectable } from '@nestjs/common';
import { Sales, SaleStatus } from '@prisma/client';
import { ErrorsTypeEnum, throwError } from '../../common/provider/handle-error.provider';
import { SalesRepository } from '../repositories';

@Injectable()
export class SalesValidator {
    constructor(private readonly salesRepository: SalesRepository) {}

    public async checkSaleByIdAndClientId(saleId: string, clientId: string): Promise<Sales | void> {
        const existingSale = await this.salesRepository.findById(saleId);

        if (!existingSale) return throwError(ErrorsTypeEnum.SaleNotFound);
        if (existingSale.clientId !== clientId) return throwError(ErrorsTypeEnum.ClientIdIsDifferent);
        if (existingSale.saleStatus !== SaleStatus.WAITING_PAYMENT) return throwError(ErrorsTypeEnum.SaleIsNotWaitingPayment);
        return existingSale;
    }
}