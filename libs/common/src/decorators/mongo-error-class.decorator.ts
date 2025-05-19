import {
  Logger,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

interface MongoValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string; path: string; value: unknown }>;
}

interface MongoCastError extends Error {
  name: 'CastError';
  path: string;
  value: unknown;
  kind: string;
  model: unknown;
}

interface MongoDuplicateKeyError extends Error {
  name: 'MongoServerError';
  code: 11000;
  keyValue: Record<string, unknown>;
  message: string;
}

type MongoError =
  | MongoValidationError
  | MongoCastError
  | MongoDuplicateKeyError
  | Error;

interface HandleMongoClassErrorsOptions {
  loggerPropertyName?: string;
  excludeMethods?: string[];
}

type Constructor<T = unknown, A extends unknown[] = unknown[]> = new (
  ...args: A
) => T;

type AsyncMethod = (...args: unknown[]) => Promise<unknown>;

export function HandleMongoClassErrors(
  options?: HandleMongoClassErrorsOptions,
) {
  return function <T extends { new (...args: any[]): any }>(
    targetConstructor: T,
  ): T {
    const loggerPropertyName = options?.loggerPropertyName || 'logger';
    const excludeMethods = options?.excludeMethods || [];

    const methodNames = Object.getOwnPropertyNames(targetConstructor.prototype);

    methodNames.forEach((methodName) => {
      if (
        methodName === 'constructor' ||
        excludeMethods.includes(methodName) ||
        typeof targetConstructor.prototype[methodName] !== 'function'
      ) {
        return;
      }

      const originalMethod = targetConstructor.prototype[
        methodName
      ] as AsyncMethod;
      const className = targetConstructor.name;

      targetConstructor.prototype[methodName] = async function (
        ...args: unknown[]
      ) {
        const logger =
          ((this as { [key: string]: unknown })[
            loggerPropertyName
          ] as Logger) || new Logger(`${className} -> ${methodName}`);
        const operationContext = `${className}.${methodName}`;

        try {
          return await originalMethod.apply(this, args);
        } catch (error: unknown) {
          if (error instanceof HttpException) {
            logger.warn(
              `Re-throwing HttpException from ${operationContext}: ${error.message}`,
            );
            throw error;
          }

          const mongoError = error as MongoError;
          logger.error(
            `MongoDB Error in ${operationContext}: ${mongoError.message}`,
            mongoError.stack,
          );

          if (mongoError.name === 'ValidationError') {
            const validationError = mongoError as MongoValidationError;
            throw new BadRequestException({
              message: `Validation failed in ${operationContext}`,
              errors: validationError.errors,
            });
          }

          if (mongoError.name === 'CastError') {
            const castError = mongoError as MongoCastError;
            throw new BadRequestException(
              `Invalid format for field ${castError.path}: ${castError.value} in ${operationContext}`,
            );
          }

          if (
            (mongoError as MongoDuplicateKeyError).code === 11000 ||
            (mongoError.name === 'MongoServerError' &&
              mongoError.message.includes('E11000 duplicate key error'))
          ) {
            const duplicateError = mongoError as MongoDuplicateKeyError;
            throw new ConflictException(
              `Duplicate key error for: ${JSON.stringify(duplicateError.keyValue)} in ${operationContext}`,
            );
          }

          throw new InternalServerErrorException(
            `A database error occurred in ${operationContext}. Original error: ${mongoError.message}`,
          );
        }
      };
    });

    return targetConstructor;
  };
}
