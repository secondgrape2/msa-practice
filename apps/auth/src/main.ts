import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService<EnvironmentVariables, true> =
    app.get(ConfigService);

  app.use(cookieParser());

  // 보안 헤더를 위한 Helmet 미들웨어 설정
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          // connectSrc: [`${process.env.API_SERVER_ORIGIN}`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  if (configService.get('NODE_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Auth API')
      .setDescription('This is an OpenAPI Specification for Auth.')
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
    SwaggerModule.setup(`/auth/docs`, app, document, {
      customCss: uiOptions.customCss,
      swaggerOptions: {
        ...uiOptions.swaggerOptions,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  const port = configService.get('PORT');
  await app.listen(port);
}
bootstrap();
