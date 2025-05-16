import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { GatewayModule } from './gateway.module';
import { validate } from './config';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: join(process.cwd(), 'apps', 'gateway', '.env'),
    }),
    GatewayModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
