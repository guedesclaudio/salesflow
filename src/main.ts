import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { ApplicationModule } from './modules/app.module';
import { LoggingInterceptor } from './modules/common/flow/logger.interceptor';
import { apiConfig } from './config/api.config';
import { createSwagger } from './config/docs.config';
import { upPubSub } from './config';

async function bootstrap(): Promise<void> { 
    const app = await NestFactory.create<NestFastifyApplication>(
        ApplicationModule,
        new FastifyAdapter()
    );

    const logger = app.get(Logger);
    app.useLogger(logger);
    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    app.setGlobalPrefix(apiConfig.prefix);
    createSwagger(app);

    upPubSub(app);
    app.startAllMicroservices();

    const port = apiConfig.port;
    const host = apiConfig.host;
    const url = new URL(`http://${host}:${port}/`);

    await app.listen(port, host, () => {
        logger.log(`Listening at ${url}`);
    });
}

bootstrap().catch(err => {
    console.error(err);
    process.exit(1);
});
