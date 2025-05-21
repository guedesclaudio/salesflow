import { Test, TestingModule } from '@nestjs/testing';
import { SalesConsumer } from './create-sale.consumer';
import { CreateSalesService } from '../../services';
import { LogService } from '../../../common/utils';
import { queuesConfig } from '../../../../config/queues.config';
import { SalesQueuesEnum } from '../../../../contracts/enums';

const mockLog = {
  Job: {
    Processing: jest.fn(),
    Completed: jest.fn(),
    Error: jest.fn(),
    Stalled: jest.fn(),
    Progress: jest.fn(),
    Active: jest.fn(),
    Waiting: jest.fn(),
    Unknown: jest.fn(),
    WorkerError: jest.fn(),
  },
};

const mockLogService = { log: () => mockLog };
const mockCreateSalesService = { processSale: jest.fn() };

const job = {
  name: queuesConfig.createSaleQueue.jobName,
  data: { saleId: 'sale-1', clientId: 'client-1' },
  id: 'job-1',
};

describe(SalesConsumer.name, () => {
  let consumer: SalesConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesConsumer,
        { provide: CreateSalesService, useValue: mockCreateSalesService },
        { provide: LogService, useValue: mockLogService },
      ],
    }).compile();

    consumer = module.get<SalesConsumer>(SalesConsumer);
  });

  describe('process', () => {
    it('should process job when name matches', async () => {
      await consumer.process(job as any);
      expect(mockLog.Job.Processing).toHaveBeenCalledWith({ type: SalesQueuesEnum.CREATE_SALE }, job.data);
      expect(mockCreateSalesService.processSale).toHaveBeenCalledWith(job.data, job);
    });

    it('should log unknown job for unmatched name', async () => {
      const unknownJob = { ...job, name: 'unknown' };
      await consumer.process(unknownJob as any);
      expect(mockLog.Job.Unknown).toHaveBeenCalledWith({ name: 'unknown' });
    });
  });

  it('should log job completed event', () => {
    consumer.onCompleted(job as any, 'done');
    expect(mockLog.Job.Completed).toHaveBeenCalledWith({ id: job.id, name: job.name }, 'done');
  });

  it('should log job failed event', () => {
    consumer.onFailed(job as any, new Error('fail'));
    expect(mockLog.Job.Error).toHaveBeenCalledWith({ id: job.id, name: job.name }, 'fail');
  });

  it('should log job stalled event', () => {
    consumer.onStalled(job as any);
    expect(mockLog.Job.Stalled).toHaveBeenCalledWith({ id: job.id, name: job.name });
  });

  it('should log job progress event', () => {
    consumer.onProgress(job as any, 75);
    expect(mockLog.Job.Progress).toHaveBeenCalledWith({ id: job.id, name: job.name }, 75);
  });

  it('should log job active event', () => {
    consumer.onActive(job as any);
    expect(mockLog.Job.Active).toHaveBeenCalledWith({ id: job.id, name: job.name });
  });

  it('should log job waiting event', () => {
    consumer.onWaiting('job-1');
    expect(mockLog.Job.Waiting).toHaveBeenCalledWith({ id: 'job-1' });
  });

  it('should log job error event', () => {
    consumer.onError(new Error('worker error'));
    expect(mockLog.Job.WorkerError).toHaveBeenCalledWith(null, new Error('worker error'));
  });
});
