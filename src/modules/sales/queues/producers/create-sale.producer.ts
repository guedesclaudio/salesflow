import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateSaleInputSchema } from '../../schemas/inputs';
import { queuesConfig } from '../../../../config/queues.config';

@Injectable()
export class SalesProducer {
  constructor(
    @InjectQueue(queuesConfig.createSaleQueue.queueName) private readonly salesQueue: Queue,
  ) {}

  public async enqueueNewSale(data: CreateSaleInputSchema) {
    const jobOptions = this.createJobOptions();
    await this.salesQueue.add(queuesConfig.createSaleQueue.jobName, data, jobOptions);
  }

  public createJobOptions() {
    return {
      attempts: queuesConfig.createSaleQueue.attempts,
      backoff: { type: 'exponential', delay: queuesConfig.createSaleQueue.backoffDelay },
      removeOnComplete: true,
      removeOnFail: false,
    }
  }
}
