import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SalesQueuesEnum } from '../../../../contracts/enums';
import { Logger } from 'nestjs-pino';
import { queuesConfig } from '../../../../config/queues.config';

@Processor(SalesQueuesEnum.CREATE_SALE, { concurrency: queuesConfig.createSaleQueue.consumerConcurrency })
export class SalesConsumer extends WorkerHost {

  constructor(private readonly logger: Logger) {
    super();
  }

  public async process(job: Job): Promise<void> {
    switch (job.name) {
      case queuesConfig.createSaleQueue.jobName:
        this.logger.log('Processing sale job:', job.data); // TODO - CHAMAR O SERVICE NOVAMENTE - METODO DE PROCESSAMENTO
        break;

      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  public async onCompleted(job: Job, result: any): Promise<void> {
    this.logger.log(`✅ Job ${job.id} (${job.name}) completed!`, result);
  }

  @OnWorkerEvent('failed')
  public async onFailed(job: Job, err: Error): Promise<void> {
    this.logger.error(`❌ Job ${job.id} (${job.name}) failed:`, err.message);
  }

  @OnWorkerEvent('stalled')
  public async onStalled(job: Job): Promise<void> {
    this.logger.warn(`⚠️ Job ${job.id} (${job.name}) stalled`);
  }

  @OnWorkerEvent('completed')
  public async onProgress(job: Job, progress: number | object): Promise<void> {
    this.logger.log(`📈 Job ${job.id} progress:`, progress);
  }

  @OnWorkerEvent('active')
  public async onActive(job: Job): Promise<void> {
    this.logger.log(`🔄 Job ${job.id} is now active`);
  }

  @OnWorkerEvent('paused')
  public async onWaiting(jobId: string): Promise<void> {
    this.logger.log(`⏳ Job ${jobId} is waiting`);
  }

  @OnWorkerEvent('error')
  public async onError(error: Error): Promise<void> {
    this.logger.error('🔥 Worker-level error:', error);
  }
}
