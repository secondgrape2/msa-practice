import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { EnvironmentVariables } from '../config';
import {
  COOKIE_NAMES,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '../constants/cookie.constants';

interface TokenResponse {
  token?: {
    jwt?: string;
    jwtRefresh?: string;
  };
}

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  private readonly origin: string | undefined;
  private readonly logger = new Logger(AuthCookieInterceptor.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.origin = this.configService.get('API_SERVER_ORIGIN', { infer: true });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((response: TokenResponse) => {
        if (!response?.token) {
          return response;
        }

        const { jwt, jwtRefresh } = response.token;

        try {
          if (jwt) {
            res.cookie(
              COOKIE_NAMES.accessToken,
              jwt,
              getAccessTokenCookieOptions(this.origin),
            );
          }

          if (jwtRefresh) {
            res.cookie(
              COOKIE_NAMES.refreshToken,
              jwtRefresh,
              getRefreshTokenCookieOptions(this.origin),
            );
          }
        } catch (error) {
          this.logger.error('Failed to set auth cookies:', error);
        }

        const { token, ...restResponse } = response;
        return restResponse;
      }),
    );
  }
}
