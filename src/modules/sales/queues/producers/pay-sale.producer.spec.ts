import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { queuesConfig } from '../../../../config/queues.config';
import { PaySalesProducer } from './pay-sale.producer';

const mockQueue = {
  add: jest.fn(),
};

describe(PaySalesProducer.name, () => {
  let service: PaySalesProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaySalesProducer,
        {
          provide: getQueueToken(queuesConfig.paySaleQueue.queueName),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<PaySalesProducer>(PaySalesProducer);
  });

  describe('enqueueNewSale', () => {
    it('should enqueue a pay sale job with correct data and options', async () => {
      // Arrange
      const dto = { clientId: '123', saleId: 'sale-1' };
      const jobOptions = service.createJobOptions();

      // Act
      await service.enqueueNewSale(dto as any);

      // Assert
      expect(mockQueue.add).toHaveBeenCalledWith(
        queuesConfig.paySaleQueue.jobName,
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
        attempts: queuesConfig.paySaleQueue.attempts,
        backoff: {
          type: 'exponential',
          delay: queuesConfig.paySaleQueue.backoffDelay,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
    });
  });
});
