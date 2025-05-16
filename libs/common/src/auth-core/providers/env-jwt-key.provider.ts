import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtAlgorithm,
  JwtSigningKeyProvider,
  JwtVerificationKeyProvider,
} from '../interfaces/jwt-key-provider.interface';

@Injectable()
export class EnvJwtKeyProvider
  implements JwtSigningKeyProvider, JwtVerificationKeyProvider
{
  constructor(private readonly configService: ConfigService) {}

  getSigningKey(algorithm: JwtAlgorithm): string {
    if (algorithm === 'HS256') {
      const secret = this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
      if (!secret) {
        throw new Error(
          'JWT_ACCESS_TOKEN_SECRET is not defined in environment variables',
        );
      }
      return secret;
    }
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  getVerificationKey(algorithm: JwtAlgorithm): string {
    return this.getSigningKey(algorithm);
  }
}
