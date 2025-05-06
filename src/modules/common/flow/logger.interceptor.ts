import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { throwError, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as useragent from 'useragent';
import { LogService } from '../utils';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      let request: any;
      const contextType: any = context.getType();

      if (contextType === 'http') {
        request = context.switchToHttp().getRequest();
      } else if (contextType === 'graphql') {
        const gqlCtx = GqlExecutionContext.create(context);
        request = gqlCtx.getContext().req;
      }


      if (!request) {
        return next.handle();
      }

      const { body, query, params, url, method, headers } = request;
      const origin = headers?.origin;
      const securityInfos = this.createSecurityInfos(request, headers);
      const data = this.createDataLog({ body, params, query });
      this.logService.log().LoggingInterceptor.Request({
        method,
        url,
        origin,
        securityInfos,
      }, data);
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

            this.logService.log().LoggingInterceptor.Response({
              method,
              url,
              responseTime,
              origin,
              securityInfos,
            }, {data, responseData: processedResponseData?.body});
          } catch (error) {
            this.logService.log().LoggingInterceptor.TotalError();
          }
        }),
        catchError((err) => {
          const responseTime = Date.now() - now;
          this.logService.log().LoggingInterceptor.ResponseError({
            method,
            url,
            responseTime,
            origin,
            securityInfos,
          }, {data, err});
          return throwError(() => err);
        }),
      );
    } catch (error) {
      this.logService.log().LoggingInterceptor.TotalError();
      return next.handle();
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
      const bodyLog = JSON.parse(JSON.stringify(body ?? {}));
      const queryLog = JSON.parse(JSON.stringify(query ?? {}));
      const paramsLog = JSON.parse(JSON.stringify(params ?? {}));

      [bodyLog, queryLog, paramsLog].forEach((value) => {
        if (value) this.handleSensitivesFields(value);
      });

      return this.returnsValidFields({
        body: bodyLog,
        query: queryLog,
        params: paramsLog,
      });
    } catch (error) {
      this.logService.log().LoggingInterceptor.AnonymizationError(error.message, error);
      return {};
    }
  }

  public returnsValidFields({ body, query, params }: any) {
    const data: { body?: any; params?: any; query?: any } = {};

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
      if (typeof data[key] === 'object') {
        this.handleSensitivesFields(data[key]);
      }
    }
  }

  public createMask(length: number): string {
    if (!length) return '';

    return '*'.repeat(length);
  }

  public isEmptyObject(obj: any): boolean {
    if (!obj) return false;
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }
}
