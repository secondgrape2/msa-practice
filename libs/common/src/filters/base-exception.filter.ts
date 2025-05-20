import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseInterface } from '../interfaces/error-response.interface';
import { BaseHttpException } from '../exceptions/base-http.exception';

@Catch(BaseHttpException)
export class BaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('BaseException');

  catch(exception: BaseHttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponseInterface = {
      statusCode: exception.getStatus(),
      timestamp: new Date().toISOString(),
      message: exception.message,
      code: exception.code,
    };

    this.logger.error(
      `${request.method} ${request.url} ${errorResponse.statusCode} - ${errorResponse.message}`,
      exception.stack,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
