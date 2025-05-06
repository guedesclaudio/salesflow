import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';

  export enum ErrorsTypeEnum {
    ClientNotFound,
    SaleNotFound,
    ClientIdIsDifferent,
    SaleAlreadyProcessed,
    SaleIsNotWaitingPayment,
    PubSubMessageTypeInvalid,
  }

  export enum ErrorsStatusEnum {
    BAD_REQUEST,
    UNAUTHORIZED,
    INTERNAL,
    NOT_FOUND,
    CONFLICT,
  }

  export const errorData: Record<
    ErrorsTypeEnum,
    { defaultMessage: string; status: ErrorsStatusEnum }
  > = {
    [ErrorsTypeEnum.ClientNotFound]: {
      defaultMessage: 'Client was not found',
      status: ErrorsStatusEnum.NOT_FOUND,
    },
    [ErrorsTypeEnum.SaleNotFound]: {
      defaultMessage: 'Sale was not found',
      status: ErrorsStatusEnum.NOT_FOUND,
    },
    [ErrorsTypeEnum.ClientIdIsDifferent]: {
      defaultMessage: 'Client id is different from client id sale',
      status: ErrorsStatusEnum.BAD_REQUEST,
    },
    [ErrorsTypeEnum.SaleAlreadyProcessed]: {
      defaultMessage: 'Sale already processed',
      status: ErrorsStatusEnum.BAD_REQUEST,
    },
    [ErrorsTypeEnum.SaleIsNotWaitingPayment]: {
      defaultMessage: 'Sale is not waiting payment',
      status: ErrorsStatusEnum.BAD_REQUEST,
    },
    [ErrorsTypeEnum.PubSubMessageTypeInvalid]: {
      defaultMessage: 'Pub/Sub Message type is invalid',
      status: ErrorsStatusEnum.BAD_REQUEST,
    },
  };

  const errorStatus = {
    [ErrorsStatusEnum.BAD_REQUEST]: (message: string) => {
      throw new BadRequestException(message);
    },
    [ErrorsStatusEnum.UNAUTHORIZED]: (message: string) => {
      throw new UnauthorizedException(message);
    },
    [ErrorsStatusEnum.INTERNAL]: (message: string) => {
      throw new InternalServerErrorException(message);
    },
    [ErrorsStatusEnum.CONFLICT]: (message: string) => {
      throw new ConflictException(message);
    },
    [ErrorsStatusEnum.NOT_FOUND]: (message: string) => {
      throw new NotFoundException(message);
    },
  };

  export function throwError(type: ErrorsTypeEnum, receivedMessage?: string): void {
    const { defaultMessage, status } = errorData[type];
    const message = receivedMessage || defaultMessage;
    errorStatus[status](message);
  }
