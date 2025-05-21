import { Test, TestingModule } from '@nestjs/testing';
import { CreateSalesService } from './create-sales.service';
import { SalesProducer } from '../queues/producers';
import { SalesRepository } from '../repositories';
import { StripeService } from '../../payment/services';
import { HttpService } from '../../common';
import { LogService } from '../../common/utils';
import { SaleStatus } from '@prisma/client';
import { MessagesEnum } from '../../../contracts/enums';

const mockSalesProducer = { enqueueNewSale: jest.fn() };
const mockSalesRepository = {
  findUniqueByConstraint: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
const mockStripeService = { createPaymentIntent: jest.fn() };
const mockHttpService = { post: jest.fn() };
const mockLogService = { log: () => ({ Sales: { AlreadyExists: jest.fn(), CheckSaleError: jest.fn(), AttemptsError: jest.fn() } }) };

const mockJob = {
  attemptsMade: 1,
  opts: { attempts: 3 },
  moveToCompleted: jest.fn(),
};

describe(CreateSalesService.name, () => {
  let service: CreateSalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSalesService,
        { provide: SalesProducer, useValue: mockSalesProducer },
        { provide: SalesRepository, useValue: mockSalesRepository },
        { provide: StripeService, useValue: mockStripeService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: LogService, useValue: mockLogService },
      ],
    }).compile();

    service = module.get<CreateSalesService>(CreateSalesService);
  });

  describe('enqueue', () => {
    it('should enqueue a new sale', async () => {
      const dto = { saleId: '1', clientId: '2', saleDate: new Date() };
      const result = await service.enqueue(dto as any);
      expect(mockSalesProducer.enqueueNewSale).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });
  });

  describe('chekSale', () => {
    it('should create a new sale if it does not exist', async () => {
      const dto = { authorizationCode: 'abc', saleDate: new Date(), webhook: 'url' };
      mockSalesRepository.findUniqueByConstraint.mockResolvedValue(null);
      mockSalesRepository.create.mockResolvedValue({ id: '1' });
      const result = await service.chekSale(dto as any, mockJob as any);
      expect(result).toEqual({ id: '1' });
    });

    it('should return false if sale exists and is not in ERROR status', async () => {
      const dto = { authorizationCode: 'abc', saleDate: new Date(), webhook: 'url' };
      mockSalesRepository.findUniqueByConstraint.mockResolvedValue({ saleStatus: SaleStatus.PROCESSED });
      const result = await service.chekSale(dto as any, mockJob as any);
      expect(mockJob.moveToCompleted).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return existing sale if it is in ERROR status', async () => {
      const dto = { authorizationCode: 'abc', saleDate: new Date(), webhook: 'web' };
      mockSalesRepository.findUniqueByConstraint.mockResolvedValue({ saleStatus: SaleStatus.ERROR });
      const result = await service.chekSale(dto as any, mockJob as any);
      expect(result).toBeDefined();
    });
  });

  describe('gateway', () => {
    it('should call stripe and send payment intent', async () => {
      const sale = { id: 'sale1', value: 100, webhook: 'url' };
      const intent = { id: 'pi_123' };
      mockStripeService.createPaymentIntent.mockResolvedValue(intent);
      mockSalesRepository.update.mockResolvedValue({ id: 'sale1' });
      const result = await service.gateway(sale as any, mockJob as any);
      expect(result).toEqual({ id: 'sale1' });
    });
  });

  describe('handleError', () => {
    it('should update sale with error', async () => {
      await service.handleError('1', 'fail');
      expect(mockSalesRepository.update).toHaveBeenCalledWith('1', {
        saleStatus: SaleStatus.ERROR,
        log: 'fail',
      });
    });
  });

  describe('handleAttemptError', () => {
    it('should move job to completed if last attempt fails', async () => {
      mockJob.attemptsMade = 2;
      mockJob.opts.attempts = 2;
      await service.handleAttemptError(mockJob as any, '1', new Error('fail'));
      expect(mockSalesRepository.update).toHaveBeenCalled();
      expect(mockJob.moveToCompleted).toHaveBeenCalledWith(MessagesEnum.OK, MessagesEnum.TRUE);
    });

    it('should throw error if not last attempt', async () => {
      mockJob.attemptsMade = 1;
      mockJob.opts.attempts = 3;
      await expect(service.handleAttemptError(mockJob as any, '1', new Error('fail'))).rejects.toThrow('fail');
    });
  });

  describe('sendPaymentIntent', () => {
    it('should send payment intent and update sale', async () => {
      const paymentIntent = { id: 'pi_123' };
      const sale = { id: 'sale1', webhook: 'url' };
      mockSalesRepository.update.mockResolvedValue({ id: 'sale1' });
      await service.sendPaymentIntent(paymentIntent as any, sale as any);
      expect(mockHttpService.post).toHaveBeenCalledWith('url', { paymentIntent });
      expect(mockSalesRepository.update).toHaveBeenCalledWith('sale1', {
        saleStatus: SaleStatus.WAITING_PAYMENT,
        log: MessagesEnum.PAYMENT_INTENT_SENT_TO_WEBHOOK,
      });
    });
  });
});
