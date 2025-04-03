import {
    CustomTransportStrategy,
    Server,
} from '@nestjs/microservices';
import { PubSub, Subscription, Message } from '@google-cloud/pubsub';
  
interface PubSubServerOptions {
    authOptions: {
      projectId: string;
      keyFile?: string;
    };
    subscriptionIds: string[];
    subscriberOptions?: object;
}
  
export class PubSubServer
    extends Server
    implements CustomTransportStrategy
  {
    private readonly pubsub: PubSub;
    private readonly subscriptions: Subscription[] = [];
  
    constructor(private readonly options: PubSubServerOptions) {
      super();
      this.pubsub = new PubSub({
        projectId: options.authOptions.projectId,
        keyFilename: options.authOptions.keyFile,
      });
    }
  
    public async listen(callback: () => void): Promise<void> {
      const { subscriptionIds, subscriberOptions } = this.options;
  
      for (const subscriptionId of subscriptionIds) {
        const subscription = this.pubsub.subscription(
          subscriptionId,
          subscriberOptions,
        );
  
        subscription.on('message', async (message: Message) => {
          const handler = this.getHandlerByPattern(subscriptionId);
  
          if (!handler) {
            console.warn(`No handler for pattern: ${subscriptionId}`);
            message.nack();
            return;
          }
  
          try {
            const result = await handler(message);
            if (result === true) {
              message.ack();
            } else {
              message.nack();
            }
          } catch (err) {
            console.error(`Error processing message on ${subscriptionId}:`, err);
            message.nack();
          }
        });
  
        subscription.on('error', (error) => {
          console.error(`Error on subscription ${subscriptionId}:`, error);
        });
  
        this.subscriptions.push(subscription);
      }
  
      callback();
    }
  
    public async close(): Promise<void> {
      await Promise.all(this.subscriptions.map((sub) => sub.close()));
    }
  
    // Required by NestJS microservices in v11+
    public on(...args: unknown[]): void {
      // No-op
    }
  
    public unwrap(): any {
      return this;
    }
  }
  