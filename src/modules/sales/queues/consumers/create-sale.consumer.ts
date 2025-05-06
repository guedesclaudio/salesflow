import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { queuesConfig } from '../../../../config/queues.config';
import { SalesQueuesEnum } from '../../../../contracts/enums';
import { CreateSalesService } from '../../services';
import { LogService } from '../../../common/utils';

@Processor(SalesQueuesEnum.CREATE_SALE, { concurrency: queuesConfig.createSaleQueue.consumerConcurrency })
export class SalesConsumer extends WorkerHost {

  constructor(
    private readonly createSalesService: CreateSalesService,
    private readonly logService: LogService,
  ) {
    super();
  }

  public async process(job: Job): Promise<void> {
    switch (job.name) {
      case queuesConfig.createSaleQueue.jobName:
        this.logService.log().Job.Processing({type: SalesQueuesEnum.CREATE_SALE}, job.data);
        await this.createSalesService.processSale(job.data, job);
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
