import {
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common';
  
  export enum ErrorsTypeEnum {
    ClientNotFound,
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
  