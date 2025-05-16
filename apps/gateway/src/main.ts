import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.use(helmet());

  if (configService.get('NODE_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Gateway API')
      .setDescription('This is an OpenAPI Specification for Gateway.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    // Swagger setup
    const uiOptions: SwaggerCustomOptions = {
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        deepLinking: true,
        defaultModelsExpandDepth: -1, // to hide schemas in Swagger UI
        defaultModelExpandDepth: 5,
        defaultModelRendering: 'model',
        displayRequestDuration: true,
        filter: true,
        docExpansion: 'list',
        queryConfigEnabled: true,
        persistAuthorization: true,
      },
      swaggerUrl: 'openapi.json',
    };

    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey}_${methodKey}`,
      ignoreGlobalPrefix: true,
    };
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup(`/api/docs`, app, document, {
      customCss: uiOptions.customCss,
      swaggerOptions: {
        ...uiOptions.swaggerOptions,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
