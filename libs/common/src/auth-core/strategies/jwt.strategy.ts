import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';
import {
  JwtVerificationKeyProvider,
  JWT_VERIFICATION_KEY_PROVIDER,
} from '../interfaces/jwt-key-provider.interface';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(JWT_VERIFICATION_KEY_PROVIDER)
    private readonly jwtKeyProvider: JwtVerificationKeyProvider,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.access_token;
        },
      ]),
      secretOrKey: jwtKeyProvider.getVerificationKey('HS256'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      ...payload,
      id: payload.sub,
    };
  }
}
