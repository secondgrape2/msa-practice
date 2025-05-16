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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      }),
      inject: [ConfigService],
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
