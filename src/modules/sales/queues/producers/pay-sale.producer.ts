import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PaySaleInputSchema } from '../../schemas/inputs';
import { queuesConfig } from '../../../../config/queues.config';

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
    }
  }
}
