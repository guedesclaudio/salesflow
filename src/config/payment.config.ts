export const paymentConfig = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    apiVersion: '2025-03-31.basil' as const,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  },
};
