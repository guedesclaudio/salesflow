import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { RawServerDefault } from 'fastify';
import { PubSubServer } from '../modules/common';

export const pubSubConfig = {
    projectId: process.env.PUBSUB_PROJECT_ID ?? '1',
    subscriptions: {
        createSale: process.env.PUBSUB_SUBSCRIPTION_CREATE_SALE
    },
    maxMessages: Number(process.env.PUBSUB_MAX_MESSAGES) ?? 1000,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

export function upPubSub(app: NestFastifyApplication<RawServerDefault>) {
    const pubsubSubscriptionsKeys = Object.keys(process.env).filter((key) =>
        key.startsWith('PUBSUB_SUBSCRIPTION'),
    );

    const pubsubSubscriptionsValues = pubsubSubscriptionsKeys.map((key) => process.env[key] ?? '');

    app.connectMicroservice({
        strategy: new PubSubServer({
            authOptions: {
                projectId: pubSubConfig.projectId,
                keyFile: pubSubConfig.credentials,
            },
            subscriptionIds: pubsubSubscriptionsValues,
            subscriberOptions: {
                flowControl: {
                  maxMessages: pubSubConfig.maxMessages,
                },
            },
        }),
    });
}