import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queuesConfig } from '../../../../config/queues.config';
import { SalesQueuesEnum } from '../../../../contracts/enums';
import { LogService } from '../../../common/utils';
import { PaySalesService } from '../../services';

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
        this.logService.log().Job.Processing({ type: SalesQueuesEnum.PAY_SALE }, job.data);
        await this.paySalesService.processPayment(job.data);
        break;

      default:
        this.logService.log().Job.Unknown({ name: job.name });
    }
  }

  @OnWorkerEvent('completed')
  public onCompleted(job: Job, result: any): void {
    this.logService.log().Job.Completed({ id: job.id, name: job.name }, result);
  }

  @OnWorkerEvent('failed')
  public onFailed(job: Job, err: Error): void {
    this.logService.log().Job.Error({ id: job.id, name: job.name }, err.message);
  }

  @OnWorkerEvent('stalled')
  public onStalled(job: Job): void {
    this.logService.log().Job.Stalled({ id: job.id, name: job.name });
  }

  @OnWorkerEvent('completed')
  public onProgress(job: Job, progress: number | object): void {
    this.logService.log().Job.Progress({ id: job.id, name: job.name }, progress);
  }

  @OnWorkerEvent('active')
  public onActive(job: Job): void {
    this.logService.log().Job.Active({ id: job.id, name: job.name });
  }

  @OnWorkerEvent('paused')
  public onWaiting(jobId: string): void {
    this.logService.log().Job.Waiting({ id: jobId });
  }

  @OnWorkerEvent('error')
  public onError(error: Error): void {
    this.logService.log().Job.WorkerError(null, error);
  }
}
