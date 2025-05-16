import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthServiceImpl } from './auth.service';
import { UserEntity, UserSchema } from './schemas/user.schema';
import { AUTH_SERVICE } from './constants/auth.constants';
import { USER_REPOSITORY } from './infrastructure/repositories/user.repository.interface';
import { MongooseUserRepository } from './infrastructure/repositories/mongoose-user.repository';
import { EnvironmentVariables } from './config';
import {
  AuthCoreModule,
  JWT_SIGNING_KEY_PROVIDER,
  JwtSigningKeyProvider,
} from '@app/common/auth-core';

@Module({
  imports: [
    AuthCoreModule,
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [AuthCoreModule],
      useFactory: async (jwtKeyProvider: JwtSigningKeyProvider) => ({
        secret: await jwtKeyProvider.getSigningKey('HS256'),
      }),
      inject: [JWT_SIGNING_KEY_PROVIDER],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthServiceImpl,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongooseUserRepository,
    },
  ],
})
export class AuthModule {}
