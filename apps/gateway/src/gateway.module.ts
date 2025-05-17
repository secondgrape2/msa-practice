import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthGatewayController } from './auth-gateway.controller';
import { GatewayService } from './gateway.service';
import {
  AuthCoreModule,
  JWT_SIGNING_KEY_PROVIDER,
  JwtSigningKeyProvider,
} from '@app/common/auth-core';
import { JwtModule } from '@nestjs/jwt';
import { EventGatewayController } from './event-gateway.controller';

@Module({
  imports: [
    HttpModule,
    AuthCoreModule,
    JwtModule.registerAsync({
      imports: [AuthCoreModule],
      useFactory: async (jwtKeyProvider: JwtSigningKeyProvider) => ({
        secret: await jwtKeyProvider.getSigningKey('HS256'),
      }),
      inject: [JWT_SIGNING_KEY_PROVIDER],
    }),
  ],
  controllers: [AuthGatewayController, EventGatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
