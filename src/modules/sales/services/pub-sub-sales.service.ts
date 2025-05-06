import { Message } from '@google-cloud/pubsub';
import { Injectable } from '@nestjs/common';
import { OriginSalesEnum } from '../../../contracts/enums';
import { ClientValidator } from '../../clients/validators';
import { ErrorsTypeEnum, throwError } from '../../common/provider/handle-error.provider';
import { LogService } from '../../common/utils';
import { CreateSaleInputSchema } from '../schemas/inputs';
import { CreateSalesService } from './create-sales.service';

@Injectable()
export class PubSubSalesService {
    constructor(
        private readonly clientValidator: ClientValidator,
        private readonly logService: LogService,
        private readonly createSalesService: CreateSalesService
    ) {}

    public async processMessage(message: Message) {
        const data: {type: string; payload: CreateSaleInputSchema} = JSON.parse(message.data.toString());
        const payload = data.payload;
        payload.origin = OriginSalesEnum.PUBSUB;

        try {
            this.logService.log().PubSub.Received(data.type, data);

            const client = await this.clientValidator.checkId(payload.clientId);
            if (!client) throwError(ErrorsTypeEnum.ClientNotFound);

            await this.createSalesService.enqueue(payload);

            this.logService.log().PubSub.Enqueued(data.type, data);
            message.ack();
            return true;
        } catch (error) {
            this.logService.log().PubSub.Error(error.message, error);
            message.ack();
            return false;
        }
    }
}