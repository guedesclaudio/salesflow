import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const docsConfig = {
  title: 'Sales Flow API',
  description: 'API payment gateway',
  prefix: '/api-docs',
  enable: process.env.SWAGGER_ENABLE,
};

export function createSwagger(app: INestApplication): void {
  if (docsConfig.enable !== '1') return;

  const options = new DocumentBuilder()
    .setTitle(docsConfig.title)
    .setDescription(docsConfig.description)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(docsConfig.prefix, app, document);
}
