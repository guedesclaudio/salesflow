import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { queuesConfig } from '../../../../config/queues.config';
import { SalesProducer } from './create-sale.producer';

const mockQueue = {
  add: jest.fn(),
};

describe(SalesProducer.name, () => {
  let service: SalesProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesProducer,
        {
          provide: getQueueToken(queuesConfig.createSaleQueue.queueName),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<SalesProducer>(SalesProducer);
  });

  describe('enqueueNewSale', () => {
    it('should enqueue a sale job with correct data and options', async () => {
      // Arrange
      const dto = { clientId: '123', saleDate: new Date().toISOString() };
      const jobOptions = service.createJobOptions();

      // Act
      await service.enqueueNewSale(dto as any);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        queuesConfig.createSaleQueue.jobName,
        dto,
        jobOptions
      );
    });
  });

  describe('createJobOptions', () => {
    it('should return expected job options', () => {
      // Act
      const options = service.createJobOptions();

      // Assert
      expect(options).toEqual({
        attempts: queuesConfig.createSaleQueue.attempts,
        backoff: {
          type: 'exponential',
          delay: queuesConfig.createSaleQueue.backoffDelay,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    });
  });
});
