import { PubSub } from '@google-cloud/pubsub';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { cacheConfig } from '../../config';
import { SalesQueuesEnum } from '../../contracts/enums/sales.enum';
import { ClientModule } from '../clients/client.module';
import { HttpService } from '../common';
import { LogService } from '../common/utils';
import { StripeService } from '../payment/services';
import { SalesController } from './controllers';
import { SalesConsumer } from './queues/consumers';
import { PaySalesConsumer } from './queues/consumers/pay-sale.consumer';
import { PaySalesProducer, SalesProducer } from './queues/producers';
import { SalesRepository } from './repositories';
import { SalesResolver } from './resolvers';
import {
  CancelSalesService,
  CreateSalesService,
  PaySalesService,
  PubSubSalesService,
} from './services';
import { SalesValidator } from './validators';

@Module({
  imports: [
    ClientModule,
    BullModule.registerQueue(
      {
        name: SalesQueuesEnum.CREATE_SALE,
        connection: cacheConfig(),
      },
      {
        name: SalesQueuesEnum.CANCEL_SALE,
        connection: cacheConfig(),
      },
      {
        name: SalesQueuesEnum.PAY_SALE,
        connection: cacheConfig(),
      },
    ),
  ],
  providers: [
    SalesRepository,
    SalesResolver,
    CreateSalesService,
    CancelSalesService,
    SalesProducer,
    SalesConsumer,
    StripeService,
    HttpService,
    PaySalesService,
    PaySalesProducer,
    PaySalesConsumer,
    SalesValidator,
    PubSub,
    PubSubSalesService,
    LogService,
  ],
  controllers: [SalesController],
})
export class SalesModule {}
