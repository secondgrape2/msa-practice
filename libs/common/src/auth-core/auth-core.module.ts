import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  JWT_SIGNING_KEY_PROVIDER,
  JWT_VERIFICATION_KEY_PROVIDER,
} from './interfaces/jwt-key-provider.interface';
import { EnvJwtKeyProvider } from './providers/env-jwt-key.provider';

@Module({
  providers: [
    {
      provide: JWT_SIGNING_KEY_PROVIDER,
      useClass: EnvJwtKeyProvider,
    },
    {
      provide: JWT_VERIFICATION_KEY_PROVIDER,
      useClass: EnvJwtKeyProvider,
    },
    JwtStrategy,
  ],
  exports: [
    JwtStrategy,
    JWT_SIGNING_KEY_PROVIDER,
    JWT_VERIFICATION_KEY_PROVIDER,
  ],
})
export class AuthCoreModule {}
