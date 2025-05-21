import { Test, TestingModule } from '@nestjs/testing';
import { PaySalesService } from './pay-sales.service';
import { PaySalesProducer } from '../queues/producers';
import { SalesRepository } from '../repositories';
import { SalesValidator } from '../validators';
import { SaleStatus } from '@prisma/client';

const mockSalesProducer = {
  enqueueNewSale: jest.fn(),
};

const mockSalesRepository = {
  update: jest.fn(),
};

const mockSalesValidator = {
  checkSaleByIdAndClientId: jest.fn(),
};

describe(PaySalesService.name, () => {
  let service: PaySalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaySalesService,
        { provide: PaySalesProducer, useValue: mockSalesProducer },
        { provide: SalesRepository, useValue: mockSalesRepository },
        { provide: SalesValidator, useValue: mockSalesValidator },
      ],
    }).compile();

    service = module.get<PaySalesService>(PaySalesService);
  });

  describe('enqueue', () => {
    it('should validate and enqueue sale', async () => {
      // Arrange
      const dto = { clientId: 'client-1', saleId: 'sale-1' };

      // Act
      const result = await service.enqueue(dto);

      // Assert
      expect(mockSalesValidator.checkSaleByIdAndClientId).toHaveBeenCalledWith('sale-1', 'client-1');
      expect(mockSalesProducer.enqueueNewSale).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });
  });

  describe('processPayment', () => {
    it('should update sale with PROCESSED status', async () => {
      // Arrange
      const dto = { saleId: 'sale-1', clientId: 'client-1' };
      const updatedSale = { id: 'sale-1', saleStatus: SaleStatus.PROCESSED };
      mockSalesRepository.update.mockResolvedValue(updatedSale);

      // Act
      const result = await service.processPayment(dto);

      // Assert
      expect(mockSalesRepository.update).toHaveBeenCalledWith('sale-1', {
        saleStatus: SaleStatus.PROCESSED,
        log: 'Sale paid successfully',
      });
      expect(result).toBe(updatedSale);
    });
  });
});
