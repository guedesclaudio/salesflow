import { Injectable } from "@nestjs/common";
import { Sales, SaleStatus } from "@prisma/client";
import { CreateSaleInputSchema } from "../schemas/inputs";
import { SalesProducer } from "../queues/producers";
import { SalesRepository } from "../repositories";
import { Job } from "bullmq";
import { Logger } from "nestjs-pino";
import { StripeService } from "../../payment/services";
import Stripe from "stripe";
import { HttpService } from "../../common";

@Injectable()
export class CreateSalesService {
    constructor(
        private readonly salesProducer: SalesProducer,
        private readonly salesRepository: SalesRepository,
        private readonly logger: Logger,
        private readonly stripe: StripeService,
        private readonly httpService: HttpService,
    ) {}

    public async enqueue(createSalesDto: CreateSaleInputSchema): Promise<Boolean> {
        await this.salesProducer.enqueueNewSale(createSalesDto);
        return true;
    }

    public async chekSale(createSalesDto: CreateSaleInputSchema, job: Job): Promise<Sales | false | undefined> {
        const { authorizationCode, saleDate } = createSalesDto;

        try {
            const existingSale = await this.salesRepository.findUniqueByConstraint(authorizationCode, saleDate);

            if (!existingSale) {
                const data = {...createSalesDto, ...this.prepareData(SaleStatus.PENDING)};
                return await this.salesRepository.create(data);
            }

            const canSkipProcessing = existingSale.saleStatus !== SaleStatus.ERROR;
            if (canSkipProcessing) {
                this.logger.warn('Sale already exists'); //TODO - CRIAR CLASSE PARA LIDAR COM LOGS E MENSAGENS
                await job.moveToCompleted('OK', 'true');
                return false;
            }

            existingSale.webhook = createSalesDto.webhook;
            return existingSale;
        } catch (error) {
            this.logger.error(`Error checking sale: ${error.message}`);
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

    public async processSale(createSalesDto: CreateSaleInputSchema, job: Job): Promise<Sales | undefined> {
        const sale = await this.chekSale(createSalesDto, job);
        if (!sale) return;

        return this.gateway(sale, job); 
    }

    public handleError(saleId: string, errorMessage: string) {
        const data = this.prepareData(SaleStatus.ERROR, errorMessage);
        return this.salesRepository.update(saleId, data);
    }

    public prepareData(saleStatus: SaleStatus, errorMessage?: string) {
        return {
            saleStatus,
            log: errorMessage,
        }
    }

    public async handleAttemptError(job: Job, saleId: string, error: Error): Promise<void | any[]> {
        const attemptsMade = job.attemptsMade + 1;
        const lastAttempt = attemptsMade >= (job.opts?.attempts ?? 0)
            
        await this.handleError(saleId, error.message);

        if (lastAttempt) {
            this.logger.error('Sale failed after all attempts') //TODO - CRIAR CLASSE PARA LIDAR COM LOGS E MENSAGENS
            return job.moveToCompleted('OK', 'true');
        }

        throw error;
    }

    public async sendPaymentIntent(paymentIntent: Stripe.Response<Stripe.PaymentIntent>, sale: Sales): Promise<Sales> {
        await this.httpService.post(sale.webhook, { paymentIntent });
        const data = this.prepareData(SaleStatus.WAITING_PAYMENT, 'Payment intent sent to webhook'); //TODO - CRIAR CLASSE PARA LIDAR COM LOGS E MENSAGENS
        return this.salesRepository.update(sale.id, data);
    }
}