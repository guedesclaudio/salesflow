import { Message } from '@google-cloud/pubsub';
import { Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSaleInputSchema } from '../../../sales/schemas/inputs';
import { ErrorsTypeEnum, throwError } from '../../provider/handle-error.provider';
import { messageProcessor } from '../../utils';

@Injectable()
export class MessagePubSubValidationPipe implements PipeTransform {
  async transform(message: Message): Promise<Message> {
    try {
      const data = messageProcessor(message);
      const { type } = data;
      const validTypes = ['create.sale'];

      if (!validTypes.includes(type)) throwError(ErrorsTypeEnum.PubSubMessageTypeInvalid);

      const dtos: Record<string, any> = {
        'create.sale': CreateSaleInputSchema,
      };
      const dto = dtos[type];

      const messageIsInvalid = await this.validateMessage(data.payload, dto);

      if (messageIsInvalid) throw new Error(messageIsInvalid as string);
      return message;
    } catch (error) {
      message.ack();
      console.error(`PubSub Validation Error: ${error.message}`);
      throw error;
    }
  }

  private async validateMessage(messageData: any, dto: any): Promise<string | boolean> {
    const messageDto = plainToInstance(dto, messageData);
    const errors = await validate(messageDto);

    if (errors.length > 0) {
      return this.generateError(errors);
    }

    return false;
  }

  private generateError(errors: any): string {
    let propertyErrors = '';
    let constraintsErrors = '';

    errors.map((error: any) => {
      propertyErrors += `${error.property}, `;
      constraintsErrors += error.children?.map(
        (constraint: any) => `${JSON.stringify(constraint?.constraints)}, `,
      );
    });
    return `Properties [${propertyErrors}] and constraints [${constraintsErrors}] are invalid`;
  }
}
