import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JwtAlgorithm,
  JwtSigningKeyProvider,
} from '../interfaces/jwt-key-provider.interface';

@Injectable()
export class EnvJwtKeyProvider implements JwtSigningKeyProvider {
  constructor(private readonly configService: ConfigService) {}

  getSigningKey(algorithm: JwtAlgorithm): string {
    if (algorithm === 'HS256') {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        console.error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      return secret;
    } else if (algorithm === 'RS256') {
      const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
      if (!privateKey) {
        console.error('JWT_PRIVATE_KEY 환경 변수가 설정되지 않았습니다.');
        throw new Error(
          'JWT_PRIVATE_KEY is not defined in environment variables',
        );
      }
      return privateKey;
    }
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}
