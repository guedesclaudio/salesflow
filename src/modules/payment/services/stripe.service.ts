import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      // TODO - LEVAR PRA CONFIG
      apiVersion: '2025-03-31.basil',
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
      process.env.STRIPE_WEBHOOK_SECRET ?? '', // TODO - LEVAR PRA CONFIG
    );
  }
}
