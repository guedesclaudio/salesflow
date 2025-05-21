import { Test, TestingModule } from '@nestjs/testing';
import { SalesResolver } from './sales.resolver';
import { CreateSalesService, CancelSalesService, PaySalesService } from '../services';
import { OriginSalesEnum } from '../../../contracts/enums/sales.enum';
import { RestrictedGuard } from '../../common';
import { ClientValidator } from '../../clients/validators';

const mockCreateSalesService = { enqueue: jest.fn() };
const mockCancelSalesService = {};
const mockPaySalesService = { enqueue: jest.fn() };
const mockClientValidator = { checkId: jest.fn() };

describe(SalesResolver.name, () => {
  let resolver: SalesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesResolver,
        {
            provide: RestrictedGuard,
            useValue: {
                canActivate: jest.fn().mockReturnValue(true),
            },
        },
        {
            provide: ClientValidator,
            useValue: mockClientValidator,
        },
        { provide: CreateSalesService, useValue: mockCreateSalesService },
        { provide: CancelSalesService, useValue: mockCancelSalesService },
        { provide: PaySalesService, useValue: mockPaySalesService },
      ],
    }).compile();

    resolver = module.get<SalesResolver>(SalesResolver);
  });

  describe('createSale', () => {
    it('should enqueue a sale with GraphQL origin and clientId from context', async () => {
      // Arrange
      const input: any = { saleDate: '2024-01-01' };
      const context = { req: { clientId: 'client-1' } };
      mockCreateSalesService.enqueue.mockResolvedValue(true);

      // Act
      const result = await resolver.createSale(input as any, context);

      // Assert
      expect(result).toBe(true);
      expect(input.origin).toBe(OriginSalesEnum.GRAPHQL);
      expect(input.clientId).toBe('client-1');
      expect(mockCreateSalesService.enqueue).toHaveBeenCalledWith(input);
    });
  });

  describe('paySale', () => {
    it('should enqueue a pay sale with clientId from context', async () => {
      // Arrange
      const input: any = { saleId: 'sale-1' };
      const context = { req: { clientId: 'client-2' } };
      mockPaySalesService.enqueue.mockResolvedValue(true);

      // Act
      const result = await resolver.paySale(input as any, context);

      // Assert
      expect(result).toBe(true);
      expect(input.clientId).toBe('client-2');
      expect(mockPaySalesService.enqueue).toHaveBeenCalledWith(input);
    });
  });
});