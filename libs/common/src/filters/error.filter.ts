import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseInterface } from '../interfaces/error-response.interface';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('Error');

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponseInterface = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      message: exception.message,
      code: 'UNKNOWN_ERROR',
    };

    this.logger.error(
      `${request.method} ${request.url} ${errorResponse.statusCode} - ${errorResponse.message}`,
      exception.stack,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
