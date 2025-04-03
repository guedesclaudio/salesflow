import { SalesJobName, SalesQueuesEnum } from '../contracts/enums';

export const queuesConfig = {
    createSaleQueue: {
        queueName: SalesQueuesEnum.CREATE_SALE,
        attempts: Number(process.env.CREATE_SALE_QUEUE_ATTEMPTS || 3),
        backoffDelay: Number(process.env.CREATE_SALE_QUEUE_BACKOFF_DELAY || 5000),
        jobName: SalesJobName.CREATE_SALE_JOB_NAME,
        consumerConcurrency: Number(process.env.CREATE_SALE_QUEUE_CONSUMER_CONCURRENCY || 5),
    },
    cancelSaleQueue: {
        queueName: SalesQueuesEnum.CANCEL_SALE,
        attempts: Number(process.env.CANCEL_SALE_QUEUE_ATTEMPTS || 3),
        backoffDelay: Number(process.env.CANCEL_SALE_QUEUE_BACKOFF_DELAY || 5000),
        jobName: SalesJobName.CANCEL_SALE_JOB_NAME,
        consumerConcurrency: Number(process.env.CANCEL_SALE_QUEUE_CONSUMER_CONCURRENCY || 5),
    }, 
    paySaleQueue: {
        queueName: SalesQueuesEnum.PAY_SALE,
        attempts: Number(process.env.PAY_SALE_QUEUE_ATTEMPTS || 3),
        backoffDelay: Number(process.env.PAY_SALE_QUEUE_BACKOFF_DELAY || 5000),
        jobName: SalesJobName.PAY_SALE_JOB_NAME,
        consumerConcurrency: Number(process.env.PAY_SALE_QUEUE_CONSUMER_CONCURRENCY || 5),
    }, 
}
