import { Injectable } from '@nestjs/common';
import { Sales, SaleStatus } from '@prisma/client';
import { Job } from 'bullmq';
import Stripe from 'stripe';
import { MessagesEnum } from '../../../contracts/enums';
import { HttpService } from '../../common';
import { LogService } from '../../common/utils';
import { StripeService } from '../../payment/services';
import { SalesProducer } from '../queues/producers';
import { SalesRepository } from '../repositories';
import { CreateSaleInputSchema } from '../schemas/inputs';

@Injectable()
export class CreateSalesService {
  constructor(
    private readonly salesProducer: SalesProducer,
    private readonly salesRepository: SalesRepository,
    private readonly stripe: StripeService,
    private readonly httpService: HttpService,
    private readonly logService: LogService,
  ) {}

  public async enqueue(createSalesDto: CreateSaleInputSchema): Promise<boolean> {
    await this.salesProducer.enqueueNewSale(createSalesDto);
    return true;
  }

  public async chekSale(
    createSalesDto: CreateSaleInputSchema,
    job: Job,
  ): Promise<Sales | false | undefined> {
    createSalesDto.saleDate = new Date(createSalesDto.saleDate);
    const { authorizationCode, saleDate } = createSalesDto;

    try {
      const existingSale = await this.salesRepository.findUniqueByConstraint(
        authorizationCode,
        saleDate,
      );

      if (!existingSale) {
        const data = { ...createSalesDto, ...this.prepareData(SaleStatus.PENDING) };
        return await this.salesRepository.create(data);
      }

      const canSkipProcessing = existingSale.saleStatus !== SaleStatus.ERROR;
      if (canSkipProcessing) {
        this.logService.log().Sales.AlreadyExists();
        await job.moveToCompleted(MessagesEnum.OK, MessagesEnum.TRUE);
        return false;
      }

      existingSale.webhook = createSalesDto.webhook;
      return existingSale;
    } catch (error) {
      this.logService.log().Sales.CheckSaleError(error.message, error);
      throw error;
    }
  }

  public async gateway(sale: Sales, job: Job): Promise<Sales | undefined> {
    try {
      const paymentIntent = await this.stripe.createPaymentIntent(sale.value, sale.id);
      return await this.sendPaymentIntent(paymentIntent, sale);
    } catch (error) {
      await this.handleAttemptError(job, sale.id, error);
    }
  }

  public async processSale(
    createSalesDto: CreateSaleInputSchema,
    job: Job,
  ): Promise<Sales | undefined> {
    const sale = await this.chekSale(createSalesDto, job);
    if (!sale) return;

    return this.gateway(sale, job);
  }

  public async handleError(saleId: string, errorMessage: string) {
    const data = this.prepareData(SaleStatus.ERROR, errorMessage);
    return this.salesRepository.update(saleId, data);
  }

  public prepareData(saleStatus: SaleStatus, errorMessage?: string) {
    return {
      saleStatus,
      log: errorMessage,
    };
  }

  public async handleAttemptError(job: Job, saleId: string, error: Error): Promise<void | any[]> {
    const attemptsMade = job.attemptsMade + 1;
    const lastAttempt = attemptsMade >= (job.opts?.attempts ?? 0);

    await this.handleError(saleId, error.message);

    if (lastAttempt) {
      this.logService.log().Sales.AttemptsError(error.message, error);
      return job.moveToCompleted(MessagesEnum.OK, MessagesEnum.TRUE);
    }

    throw error;
  }

  public async sendPaymentIntent(
    paymentIntent: Stripe.Response<Stripe.PaymentIntent>,
    sale: Sales,
  ): Promise<Sales> {
    await this.httpService.post(sale.webhook, { paymentIntent });
    const data = this.prepareData(
      SaleStatus.WAITING_PAYMENT,
      MessagesEnum.PAYMENT_INTENT_SENT_TO_WEBHOOK,
    );
    return this.salesRepository.update(sale.id, data);
  }
}
