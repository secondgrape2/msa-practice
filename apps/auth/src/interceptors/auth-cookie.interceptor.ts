import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import {
  COOKIE_NAMES,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../constants/cookie.constants';

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((response) => {
        const token = response?.token;
        if (token) {
          const { jwt, jwtRefresh } = token;
          if (jwt) {
            res.cookie(
              COOKIE_NAMES.accessToken,
              jwt,
              ACCESS_TOKEN_COOKIE_OPTIONS,
            );
          }

          if (jwtRefresh) {
            res.cookie(
              COOKIE_NAMES.refreshToken,
              jwtRefresh,
              REFRESH_TOKEN_COOKIE_OPTIONS,
            );
          }
        }

        return response;
      }),
    );
  }
}
