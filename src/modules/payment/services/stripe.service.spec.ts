import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { paymentConfig } from '../../../config';

jest.mock('stripe');

describe(StripeService.name, () => {
  let service: StripeService;
  let paymentIntentCreateMock: jest.Mock;
  let constructEventMock: jest.Mock;

  beforeEach(async () => {
    paymentIntentCreateMock = jest.fn();
    constructEventMock = jest.fn();

    (Stripe as unknown as jest.Mock).mockImplementation(() => ({
      paymentIntents: {
        create: paymentIntentCreateMock,
      },
      webhooks: {
        constructEvent: constructEventMock,
      },
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent with correct parameters', async () => {
      // Arrange
      const mockResponse = { id: 'pi_123', amount: 5000 };
      paymentIntentCreateMock.mockResolvedValue(mockResponse);
      const amount = 5000;
      const saleId = 'sale_001';

      // Act
      const result = await service.createPaymentIntent(amount, saleId);

      // Assert
      expect(result).toBe(mockResponse);
      expect(paymentIntentCreateMock).toHaveBeenCalledWith({
        amount,
        currency: 'brl',
        payment_method_types: ['card'],
        metadata: { saleId },
      });
    });
  });

  describe('constructStripeEvent', () => {
    it('should construct a stripe event using webhook secret', () => {
      // Arrange
      const payload = Buffer.from('test-payload');
      const signature = 'test-signature';
      const eventMock = { id: 'evt_123', type: 'payment_intent.succeeded' };

      constructEventMock.mockReturnValue(eventMock);

      // Act
      const result = service.constructStripeEvent(payload, signature);

      // Assert
      expect(result).toBe(eventMock);
      expect(constructEventMock).toHaveBeenCalledWith(
        payload,
        signature,
        paymentConfig.stripe.webhookSecret,
      );
    });
  });
});
