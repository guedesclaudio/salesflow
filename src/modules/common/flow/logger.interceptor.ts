import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as useragent from 'useragent';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): any {
    try {
      const request = context.switchToHttp().getRequest();
      const { body, query, params, url, method, headers } = request;
      const origin = headers?.origin;
      const securityInfos = this.createSecurityInfos(request, headers);

      const data = this.createDataLog({
        body,
        params,
        query,
      });

      this.logRequest({
        method,
        url,
        origin,
        data,
        securityInfos,
      });

      const now = Date.now();
      return next.handle().pipe(
        tap((responseData) => {
          try {
            const responseTime = Date.now() - now;
            const processedResponseData = this.createDataLog({
              body: { ...responseData },
              params: null,
              query: null,
            }) as { body: any };

            this.logResponse({
              method,
              url,
              responseTime,
              data,
              responseData: processedResponseData.body,
              securityInfos,
              origin,
            });
          } catch (error) {
            this.logTotalError();
          }
        }),
        catchError((err) => {
          const responseTime = Date.now() - now;
          this.logResponseError({
            method,
            url,
            responseTime,
            data: {},
            err,
            securityInfos,
            origin,
          });
          return throwError(() => err);
        }),
      );
    } catch (error) {
      this.logTotalError();
    }
  }

  public createSecurityInfos(request: any, headers: any) {
    const userAgentString = headers['user-agent'];
    const userAgent = useragent.parse(userAgentString);

    return {
      ipAddress: request.ip,
      operationalSystem: userAgent.os.toString(),
      browser: userAgent.toAgent(),
      device: userAgent.device.toString(),
      uaSource: userAgent.source,
    };
  }

  public createDataLog({ body, query, params }: any) {
    try {
      const bodyLog = JSON.parse(JSON.stringify(body));
      const queryLog = JSON.parse(JSON.stringify(query));
      const paramsLog = JSON.parse(JSON.stringify(params));

      [bodyLog, queryLog, paramsLog].forEach((value) => {
        if (value) this.handleSensitivesFields(value);
      });

      return this.returnsValidFields({
        body: bodyLog,
        query: queryLog,
        params: paramsLog,
      });
    } catch (error) {
      this.logger.error(`Anonymization Error - Error: ${error?.message}}`);
    }
  }

  public logRequest({ method, url, origin, data, securityInfos }: any): void {
    return this.logger.log(
      `Request: [${method}] ${url} - Origin ${origin} - Data: ${JSON.stringify(
        data,
      )} - SecurityInfos: ${JSON.stringify(securityInfos)}`,
    );
  }

  public logTotalError(): void {
    return this.logger.error('Error: Log total error occurred.');
  }

  public logResponse({
    method,
    url,
    responseTime,
    data,
    responseData,
    securityInfos,
    origin,
  }: any): void {
    return this.logger.log(
      `Response: [${method}] ${url} - Time: ${responseTime}ms - Origin ${origin} - InputData: ${JSON.stringify(
        data,
      )} - ResponseData: ${JSON.stringify(responseData)} - SecurityInfos: ${JSON.stringify(
        securityInfos,
      )}`,
    );
  }

  public logResponseError({ method, url, responseTime, data, err, securityInfos, origin }: any): void {
    return this.logger.error(
      `ResponseError: [${method}] ${url} - Time: ${responseTime}ms - Origin ${origin} - InputData: ${JSON.stringify(
        data,
      )} - Error: ${JSON.stringify(err?.message)} - SecurityInfos: ${JSON.stringify(
        securityInfos,
      )}`,
    );
  }

  public returnsValidFields({ body, query, params }: any) {
    const data: {
      body?: any;
      params?: any;
      query?: any;
    } = {};

    if (body && !this.isEmptyObject(body)) data.body = body;
    if (params && !this.isEmptyObject(params)) data.params = params;
    if (query && !this.isEmptyObject(query)) data.query = query;

    return data;
  }

    public handleSensitivesFields<T>(data: T): any {
        const sensitiveFields = (process.env.LOGS_SENSITIVE_FIELDS || '')
        .split(',')
        .map((value) => value.trim());
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        for (const key in data) {
            if (sensitiveFields.includes(key)) {
            const value = data[key];

            if (typeof value === 'string') data[key] = this.createMask(value.length) as any;
            }

            if (typeof data[key] === 'object') this.handleSensitivesFields(data[key]);
        }
    }

    public createMask(length: number): string {
    if (!length) return '';

    const char = '*';
    let mask = '';

    for (let i = 0; i < length; i++) {
      mask += char;
    }

    return mask;
  }

  public isEmptyObject(obj: any): boolean {
    if (!obj) return false;
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}
