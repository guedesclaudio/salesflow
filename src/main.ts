import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ApplicationModule } from './modules/app.module';
//import { LoggingInterceptor } from './modules/common/flow/logger.interceptor';

const API_DEFAULT_PORT = 3000; //TODO - LEVAR ISSO PRA CONFIG
const API_DEFAULT_PREFIX = '/api/v1/';
const SWAGGER_TITLE = 'Sales Flow API';
const SWAGGER_DESCRIPTION = 'API payment gateway';
const SWAGGER_PREFIX = '/docs';

function createSwagger(app: INestApplication) { //TODO - LEVAR PRA OUTRO LUGAR
    const options = new DocumentBuilder()
        .setTitle(SWAGGER_TITLE)
        .setDescription(SWAGGER_DESCRIPTION)
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(SWAGGER_PREFIX, app, document);
}

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestFastifyApplication>(
        ApplicationModule,
        new FastifyAdapter()
    );
    const logger = app.get(Logger);
    app.useLogger(logger);
    //app.useGlobalInterceptors(new LoggingInterceptor(app.get(Logger)));
    app.setGlobalPrefix(process.env.API_PREFIX || API_DEFAULT_PREFIX);

    if (!process.env.SWAGGER_ENABLE || process.env.SWAGGER_ENABLE === '1') {
        createSwagger(app);
    }
    const port = process.env.API_PORT || API_DEFAULT_PORT;
    const host = process.env.API_HOST || 'localhost';
    const url = new URL(`http://${host}:${port}/`);
    
    await app.listen(port, host, () => {
        console.log(`Listening at ${url}`); 
    });
}

bootstrap().catch(err => {
    // eslint-disable-next-line no-console
    console.error(err);

    const defaultExitCode = 1;
    process.exit(defaultExitCode);
});
