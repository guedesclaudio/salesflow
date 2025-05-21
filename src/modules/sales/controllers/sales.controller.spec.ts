import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import {
  CancelSalesService,
  CreateSalesService,
  PaySalesService,
  PubSubSalesService,
} from '../services';
import { OriginSalesEnum } from '../../../contracts/enums/sales.enum';
import { RestrictedGuard } from '../../common';
import { Message } from '@google-cloud/pubsub';
import { ClientValidator } from '../../clients/validators';

const mockCreateSalesService = { enqueue: jest.fn() };
const mockCancelSalesService = { cancel: jest.fn() };
const mockPaySalesService = { enqueue: jest.fn() };
const mockPubSubSalesService = { processMessage: jest.fn() };
const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };
const mockClientValidator = { checkId: jest.fn() };

describe(SalesController.name, () => {
  let controller: SalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
            provide: ClientValidator,
            useValue: mockClientValidator,
        },
        { provide: CreateSalesService, useValue: mockCreateSalesService },
        { provide: CancelSalesService, useValue: mockCancelSalesService },
        { provide: PaySalesService, useValue: mockPaySalesService },
        { provide: PubSubSalesService, useValue: mockPubSubSalesService },
        { provide: RestrictedGuard, useValue: mockGuard },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  describe('createSale', () => {
    it('should enqueue a new sale with HTTP origin and clientId', async () => {
      // Arrange
      const dto: any = { saleDate: '2024-01-01' };
      const req = { clientId: 'client-1' } as any;
      mockCreateSalesService.enqueue.mockResolvedValue(true);

      // Act
      const result = await controller.createSale(dto as any, req);

      // Assert
      expect(result).toBe(true);
      expect(dto.origin).toBe(OriginSalesEnum.HTTP);
      expect(dto.clientId).toBe('client-1');
      expect(mockCreateSalesService.enqueue).toHaveBeenCalledWith(dto);
    });
  });

  describe('paySale', () => {
    it('should enqueue a payment with clientId', async () => {
      // Arrange
      const dto: any = { saleId: 'sale-1' };
      const req = { clientId: 'client-1' } as any;
      mockPaySalesService.enqueue.mockResolvedValue(true);

      // Act
      const result = await controller.paySale(dto as any, req);

      // Assert
      expect(result).toBe(true);
      expect(dto.clientId).toBe('client-1');
      expect(mockPaySalesService.enqueue).toHaveBeenCalledWith(dto);
    });
  });

  describe('createSaleFromPubSub', () => {
    it('should process a sale message from PubSub', async () => {
      // Arrange
      const message = { data: Buffer.from(JSON.stringify({ type: 'SALE', payload: { clientId: '123' } })) } as unknown as Message;
      mockPubSubSalesService.processMessage.mockResolvedValue(true);

      // Act
      const result = await controller.createSaleFromPubSub(message);

      // Assert
      expect(result).toBe(true);
      expect(mockPubSubSalesService.processMessage).toHaveBeenCalledWith(message);
    });
  });

  describe('cancelSale', () => {
    it('should call cancel service with id', async () => {
      // Arrange
      const id = 123;
      const expected = { id, status: 'CANCELED' };
      mockCancelSalesService.cancel.mockResolvedValue(expected);

      // Act
      const result = await controller.cancelSale(id);

      // Assert
      expect(result).toBe(expected);
      expect(mockCancelSalesService.cancel).toHaveBeenCalledWith(id);
    });
  });
});
