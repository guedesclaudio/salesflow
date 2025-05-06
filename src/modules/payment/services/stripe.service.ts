import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { paymentConfig } from '../../../config';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(paymentConfig.stripe.secretKey, {
      apiVersion: paymentConfig.stripe.apiVersion,
    });
  }

  public async createPaymentIntent(amount: number, saleId: string) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      payment_method_types: ['card'],
      metadata: {
        saleId,
      },
    });
    return paymentIntent;
  }

  public constructStripeEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      paymentConfig.stripe.webhookSecret,
    );
  }
}
