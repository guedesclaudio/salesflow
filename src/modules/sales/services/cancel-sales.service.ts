import { Injectable } from '@nestjs/common';
import { SaleStatus } from '@prisma/client';

@Injectable()
export class CancelSalesService {
  constructor() {}

  public cancel(id: number) {
    return {
      id: 0,
      authorizationCode: 'string;',
      clientId: 1,
      saleStatus: SaleStatus.CANCELED,
      value: 1,
      userCode: 'string;',
      saleDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    };
  }
}
