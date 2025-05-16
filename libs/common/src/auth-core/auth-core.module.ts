import { Module } from '@nestjs/common';
import { JWT_SIGNING_KEY_PROVIDER } from './interfaces/jwt-key-provider.interface';
import { EnvJwtKeyProvider } from './providers/env-jwt-key.provider';

@Module({
  providers: [
    {
      provide: JWT_SIGNING_KEY_PROVIDER,
      useClass: EnvJwtKeyProvider,
    },
  ],
  exports: [JWT_SIGNING_KEY_PROVIDER],
})
export class AuthCoreModule {}
