import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseHttpException } from '../exceptions/base-http.exception';
import { ErrorResponseInterface } from '../interfaces/error-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorResponse: ErrorResponseInterface = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exceptionResponse.message || exception.message,
      code:
        exception instanceof BaseHttpException
          ? exceptionResponse.code
          : 'HTTP_EXCEPTION',
    };

    response.status(status).json(errorResponse);
  }
}
