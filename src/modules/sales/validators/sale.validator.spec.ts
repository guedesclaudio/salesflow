import { Test, TestingModule } from '@nestjs/testing';
import { SalesValidator } from './sale.validator';
import { SalesRepository } from '../repositories';
import { SaleStatus } from '@prisma/client';
import { ErrorsTypeEnum } from '../../common/provider/handle-error.provider';

jest.mock('../../common/provider/handle-error.provider', () => ({
  throwError: jest.fn((error) => {
    throw { type: error };
  }),
  ErrorsTypeEnum: {
    SaleNotFound: 'SaleNotFound',
    ClientIdIsDifferent: 'ClientIdIsDifferent',
    SaleIsNotWaitingPayment: 'SaleIsNotWaitingPayment',
  },
}));

const mockSalesRepository = {
  findById: jest.fn(),
};

describe(SalesValidator.name, () => {
  let service: SalesValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesValidator,
        { provide: SalesRepository, useValue: mockSalesRepository },
      ],
    }).compile();

    service = module.get<SalesValidator>(SalesValidator);
  });

  describe('checkSaleByIdAndClientId', () => {
    it('should return sale if all conditions pass', async () => {
      // Arrange
      const mockSale = {
        id: 'sale-1',
        clientId: 'client-1',
        saleStatus: SaleStatus.WAITING_PAYMENT,
      };
      mockSalesRepository.findById.mockResolvedValue(mockSale);

      // Act
      const result = await service.checkSaleByIdAndClientId('sale-1', 'client-1');

      // Assert
      expect(result).toBe(mockSale);
    });

    it('should throw SaleNotFound if no sale is found', async () => {
      // Arrange
      mockSalesRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.checkSaleByIdAndClientId('sale-1', 'client-1'),
      ).rejects.toEqual({ type: ErrorsTypeEnum.SaleNotFound });
    });

    it('should throw ClientIdIsDifferent if clientId does not match', async () => {
      // Arrange
      const mockSale = {
        id: 'sale-1',
        clientId: 'another-client',
        saleStatus: SaleStatus.WAITING_PAYMENT,
      };
      mockSalesRepository.findById.mockResolvedValue(mockSale);

      // Act & Assert
      await expect(
        service.checkSaleByIdAndClientId('sale-1', 'client-1'),
      ).rejects.toEqual({ type: ErrorsTypeEnum.ClientIdIsDifferent });
    });

    it('should throw SaleIsNotWaitingPayment if sale status is different', async () => {
      // Arrange
      const mockSale = {
        id: 'sale-1',
        clientId: 'client-1',
        saleStatus: SaleStatus.PROCESSED,
      };
      mockSalesRepository.findById.mockResolvedValue(mockSale);

      // Act & Assert
      await expect(
        service.checkSaleByIdAndClientId('sale-1', 'client-1'),
      ).rejects.toEqual({ type: ErrorsTypeEnum.SaleIsNotWaitingPayment });
    });
  });
});
