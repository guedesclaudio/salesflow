import { Module } from '@nestjs/common';
import { SalesController } from './controllers';
import { ClientModule } from '../clients/client.module';
import { SalesResolver } from './resolvers';
import { SalesRepository } from './repositories';
import { CancelSalesService, CreateSalesService } from './services';
import { BullModule } from '@nestjs/bullmq';
import { SalesQueuesEnum } from '../../contracts/enums/sales.enum';
import { cacheConfig } from '../../config';
import { SalesProducer } from './queues/producers';
import { SalesConsumer } from './queues/consumers';

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
    },),
  ],
  providers: [SalesRepository, SalesResolver, CreateSalesService, CancelSalesService, SalesProducer, SalesConsumer],
  controllers: [SalesController],
})
export class SalesModule {}
