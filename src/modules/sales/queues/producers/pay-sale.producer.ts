import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { queuesConfig } from '../../../../config/queues.config';
import { PaySaleInputSchema } from '../../schemas/inputs';

@Injectable()
export class PaySalesProducer {
  constructor(
    @InjectQueue(queuesConfig.paySaleQueue.queueName) private readonly salesQueue: Queue,
  ) {}

  public async enqueueNewSale(data: PaySaleInputSchema) {
    const jobOptions = this.createJobOptions();
    await this.salesQueue.add(queuesConfig.paySaleQueue.jobName, data, jobOptions);
  }

  public createJobOptions() {
    return {
      attempts: queuesConfig.paySaleQueue.attempts,
      backoff: { type: 'exponential', delay: queuesConfig.paySaleQueue.backoffDelay },
      removeOnComplete: true,
      removeOnFail: false,
    };
  }
}
