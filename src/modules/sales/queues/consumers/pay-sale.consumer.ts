import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queuesConfig } from '../../../../config/queues.config';
import { SalesQueuesEnum } from '../../../../contracts/enums';
import { PaySalesService } from '../../services';
import { LogService } from '../../../common/utils';

@Processor(SalesQueuesEnum.PAY_SALE, { concurrency: queuesConfig.paySaleQueue.consumerConcurrency })
export class PaySalesConsumer extends WorkerHost {

  constructor(
    private readonly logService: LogService,
    private readonly paySalesService: PaySalesService,
  ) {
    super();
  }

  public async process(job: Job): Promise<void> {
    switch (job.name) {
      case queuesConfig.paySaleQueue.jobName:
        this.logService.log().Job.Processing({type: SalesQueuesEnum.PAY_SALE}, job.data);
        await this.paySalesService.processPayment(job.data);
        break;

      default:
        this.logService.log().Job.Unknown({name: job.name});
    }
  }

  @OnWorkerEvent('completed')
  public async onCompleted(job: Job, result: any): Promise<void> {
    this.logService.log().Job.Completed({id: job.id, name: job.name}, result);
  }

  @OnWorkerEvent('failed')
  public async onFailed(job: Job, err: Error): Promise<void> {
    this.logService.log().Job.Error({id: job.id, name: job.name}, err.message);
  }

  @OnWorkerEvent('stalled')
  public async onStalled(job: Job): Promise<void> {
    this.logService.log().Job.Stalled({id: job.id, name: job.name});
  }

  @OnWorkerEvent('completed')
  public async onProgress(job: Job, progress: number | object): Promise<void> {
    this.logService.log().Job.Progress({id: job.id, name: job.name}, progress);
  }

  @OnWorkerEvent('active')
  public async onActive(job: Job): Promise<void> {
    this.logService.log().Job.Active({id: job.id, name: job.name});
  }

  @OnWorkerEvent('paused')
  public async onWaiting(jobId: string): Promise<void> {
    this.logService.log().Job.Waiting({id: jobId});
  }

  @OnWorkerEvent('error')
  public async onError(error: Error): Promise<void> {
    this.logService.log().Job.WorkerError(null, error);
  }
}
