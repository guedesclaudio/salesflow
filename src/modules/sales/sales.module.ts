import { Module } from '@nestjs/common';
import { SalesController } from './controllers';
import { ClientModule } from '../clients/client.module';
import { SalesResolver } from './resolvers';
import { SalesRepository } from './repositories';
import { CancelSalesService, CreateSalesService, PaySalesService } from './services';
import { BullModule } from '@nestjs/bullmq';
import { SalesQueuesEnum } from '../../contracts/enums/sales.enum';
import { cacheConfig } from '../../config';
import { PaySalesProducer, SalesProducer } from './queues/producers';
import { SalesConsumer } from './queues/consumers';
import { StripeService } from '../payment/services';
import { HttpService } from '../common';
import { PaySalesConsumer } from './queues/consumers/pay-sale.consumer';
import { SalesValidator } from './validators';

@Module({
  imports: [
    ClientModule,
    BullModule.registerQueue({
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
  ],
  controllers: [SalesController],
})
export class SalesModule {}
