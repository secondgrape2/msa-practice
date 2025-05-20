import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseHttpException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code?: string,
  ) {
    super(
      {
        message,
        code,
      },
      status,
    );
  }
}
