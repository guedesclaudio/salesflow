import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export function ApiResponses({
  sucessStatusCode,
  succesType,
  isProtected,
}: {
  sucessStatusCode: number;
  succesType: any;
  isProtected?: boolean;
}) {
  const decorators = [
    ApiResponse({ status: sucessStatusCode, description: 'Success', type: succesType }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' }),
  ];

  if (isProtected) {
    decorators.push(ApiBearerAuth());
  }

  return applyDecorators(...decorators);
}
