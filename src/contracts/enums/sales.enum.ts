import { registerEnumType } from "@nestjs/graphql";
import { SaleStatus } from "@prisma/client";

registerEnumType(SaleStatus, {
    name: 'SaleStatus',
    description: 'The status of a sale',
});

export enum OriginSalesEnum {
    GRAPHQL = 'GRAPHQL',
    HTTP = 'HTTP',
    PUBSUB = 'PUBSUB',
}

export enum SalesQueuesEnum {
    CREATE_SALE = 'CREATE_SALE',
    CANCEL_SALE = 'CANCEL_SALE',
    PAY_SALE = 'PAY_SALE',
}

export enum SalesJobName {
    CREATE_SALE_JOB_NAME = 'CREATE_SALE_JOB_NAME',
    CANCEL_SALE_JOB_NAME = 'CREATE_SALE_JOB_NAME',
    PAY_SALE_JOB_NAME = 'PAY_SALE_JOB_NAME',
}