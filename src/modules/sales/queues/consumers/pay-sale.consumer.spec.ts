import { Test, TestingModule } from '@nestjs/testing';
import { PaySalesConsumer } from './pay-sale.consumer';
import { PaySalesService } from '../../services';
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
const mockPaySalesService = { processPayment: jest.fn() };

const job = {
  name: queuesConfig.paySaleQueue.jobName,
  data: { saleId: '123', clientId: '456' },
  id: 'job-1',
};

describe(PaySalesConsumer.name, () => {
  let consumer: PaySalesConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaySalesConsumer,
        { provide: LogService, useValue: mockLogService },
        { provide: PaySalesService, useValue: mockPaySalesService },
      ],
    }).compile();

    consumer = module.get<PaySalesConsumer>(PaySalesConsumer);
  });

  describe('process', () => {
    it('should call processPayment when job name matches', async () => {
      await consumer.process(job as any);
      expect(mockLog.Job.Processing).toHaveBeenCalledWith({ type: SalesQueuesEnum.PAY_SALE }, job.data);
      expect(mockPaySalesService.processPayment).toHaveBeenCalledWith(job.data);
    });

    it('should call log unknown job for unmatched job name', async () => {
      const unknownJob = { ...job, name: 'unknown' };
      await consumer.process(unknownJob as any);
      expect(mockLog.Job.Unknown).toHaveBeenCalledWith({ name: 'unknown' });
    });
  });

  it('should log job completed event', () => {
    consumer.onCompleted(job as any, 'ok');
    expect(mockLog.Job.Completed).toHaveBeenCalledWith({ id: job.id, name: job.name }, 'ok');
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
    consumer.onProgress(job as any, 50);
    expect(mockLog.Job.Progress).toHaveBeenCalledWith({ id: job.id, name: job.name }, 50);
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
