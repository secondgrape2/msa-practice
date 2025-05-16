import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (
        request: Request,
        token: JwtPayload,
        done: (error: Error | null, key?: string) => void,
      ) => {
        try {
          const algorithm = 'HS256'; // TODO: 토큰에서 알고리즘 추출
          const key = await this.jwtKeyProvider.getVerificationKey(algorithm);
          done(null, key);
        } catch (error) {
          done(error as Error);
        }
      },
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
