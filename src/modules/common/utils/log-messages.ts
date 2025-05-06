import { Injectable, Query } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Injectable()
export class LogService {
    constructor(private readonly logger: Logger) {}

    public log() {
        return {
            Auth: {
                InvalidRole: (role: string, context: any) => this.logger.log(`User attempted access with invalid role: ${role}`, context),
                LoginSuccess: (userId: string, context: any) => this.logger.log(`User ${userId} successfully logged in`, context),
                LoginFailed: (reason: string, context: any) => this.logger.log(`Login failed: ${reason}`, context),
              },
              Sales: {
                Created: (saleId: string, context: any) => this.logger.log(`Sale ${saleId} created successfully`, context),
                Failed: (reason: string, context: any) => this.logger.log(`Sale processing failed: ${reason}`, context),
                AlreadyExists: (context?: any) => this.logger.warn('Sale already exists', context),
                CheckSaleError: (error: Error, context?: any) => this.logger.error(`Error checking sale: ${error.message}`, context),
                AttemptsError: (error: any, context?: any) => this.logger.error('Sale failed after all attempts', context),
              },
              PubSub: {
                Received: (type: string, context: any) => this.logger.log(`Received PubSub message with type: ${type}`, context),
                Enqueued: (type: string, context: any) => this.logger.log(`Enqueued PubSub message with type: ${type}`, context),
                Error: (error: Error, context: any) => this.logger.log(`PubSub error: ${error.message}`, context),
                InvalidType: (type: string, context: any) => this.logger.log(`Received PubSub message with invalid type: ${type}`, context),
                ValidationError: (errors: string, context: any) => this.logger.log(`PubSub payload validation error: ${errors}`, context),
              },
              General: {
                UnexpectedError: (action: string, error: Error, context: any) =>
                  this.logger.log(`Unexpected error while ${action}: ${error.message}`, context),
              },
              LoggingInterceptor: {
                AnonymizationError: (error: any, context: any) => this.logger.error(`Anonymization Error: ${error.message}`, context),
                Request: (params: any, context: any) => this.logger.log(`Request: [${params.method}] ${params.url} - Origin ${params.origin} - SecurityInfos: ${JSON.stringify(params.securityInfos)}`, context),
                TotalError: () => this.logger.error('Error: Log total error occurred.'),
                Response: (params: any, context: any) => this.logger.log(`Response: [${params.method}] ${params.url} - Time: ${params.responseTime}ms - Origin ${params.origin} - SecurityInfos: ${JSON.stringify(params.securityInfos)}`, context),
                ResponseError: (params: any, context: any) => this.logger.error(`ResponseError: [${params.method}] ${params.url} - Time: ${params.responseTime}ms - Origin ${params.origin} - Error: ${JSON.stringify(params.error?.message)} - SecurityInfos: ${JSON.stringify(params.securityInfos)}`, context),
              },
              Prisma: {
                Query: (params: any) => this.logger.log(params),
                Info: (params: any) => this.logger.log(params),
                Warn: (params: any) => this.logger.warn(params),
                Error: (params: any) => this.logger.error(params),
                Connected: () => this.logger.log('Connected Prisma'),
                Disconnected: () => this.logger.log('Desconnected Prisma'),
              },
              Job: {
                Processing: (params: any, context: any) => this.logger.log(`Processing ${params.type} Job`, context),
                Unknown: (params: any, context?: any) => this.logger.warn(`Unknown job name: ${params.name}`, context),
                Completed: (params: any, context: any) => this.logger.log(`✅ Job ${params.id} - (${params.name}) completed!`, context),
                Error: (params: any, context: any) => this.logger.error(`❌ Job ${params.id} - (${params.name}) failed:`, context),
                Stalled: (params: any, context?: any) => this.logger.warn(`⚠️ Job ${params.id} - (${params.name}) stalled`, context),
                Progress: (params: any, context: any) => this.logger.log(`📈 Job ${params.id} progress`, context),
                Active: (params: any, context?: any) => this.logger.log(`🔄 Job ${params.id} is now active`),
                Waiting: (params: any, context?: any) => this.logger.log(`⏳ Job ${params.id} is waiting`),
                WorkerError: (params: any, context?: any) => this.logger.error('🔥 Worker-level error:', context),
              }
        };
    }
}
