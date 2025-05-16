// 주요 NestJS 및 기타 모듈 임포트
import { NestApplicationOptions } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

export const nestApplicationOptions: NestApplicationOptions = {
  cors: {
    origin: (origin, callback) => {
      return callback(null, [/^http:\/\/localhost/]);
    },
    credentials: true,
    exposedHeaders: ['x-total-count', 'Date'],
  },
  bodyParser: false,
};

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  MONGODB_URI: string;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsString()
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});
      return `${error.property}: ${constraints.join(', ')}`;
    });
    throw new Error(
      `Configuration validation failed:\n${errorMessages.join('\n')}`,
    );
  }
  return validatedConfig;
}
