import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { validate } from './config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: join(process.cwd(), 'apps', 'auth', '.env'),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/auth',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
