import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto, SignInDto } from '@app/common/auth-core/dtos';
import { UserRepository } from './infrastructure/repositories/user.repository.interface';
import { USER_REPOSITORY } from './infrastructure/repositories/user.repository.interface';
import { AuthActions } from './domain/actions/auth.actions';
import { AuthService, User } from './interfaces/auth.interface';
import { EnvironmentVariables } from './config';
import {
  JwtSigningKeyProvider,
  JWT_SIGNING_KEY_PROVIDER,
} from '@app/common/auth-core/interfaces/jwt-key-provider.interface';
import { UserNotFoundException } from './exceptions/auth.exceptions';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    @Inject(JWT_SIGNING_KEY_PROVIDER)
    private readonly jwtKeyProvider: JwtSigningKeyProvider,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    await AuthActions.validatePasswordFormat(signUpDto.password);
    const { email, password } = signUpDto;
    const existingUser = await this.userRepository.findByEmail(email);
    AuthActions.validateUniqueUser(existingUser);

    const hashedPassword = await AuthActions.hashPassword(password);
    const user = await this.userRepository.create(email, hashedPassword);
    return user;
  }

  async signIn(signInDto: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }> {
    await AuthActions.validatePasswordFormat(signInDto.password);
    const user = await this.userRepository.findByEmail(signInDto.email);
    const validatedUser = AuthActions.validateUserCredentials(
      user,
      await AuthActions.comparePassword(
        signInDto.password,
        user?.password || '',
      ),
    );

    const { accessToken, refreshToken } =
      await this.generateTokens(validatedUser);

    await this.userRepository.update(validatedUser.id, {
      lastLoginAt: new Date(),
    });
    return {
      accessToken,
      refreshToken,
      user: validatedUser,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    const isPasswordValid = await AuthActions.comparePassword(
      password,
      user?.password || '',
    );
    return AuthActions.validateUserCredentials(user, isPasswordValid);
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; user: User }> {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
    AuthActions.validateRefreshToken(payload);

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UserNotFoundException();
    }

    const accessToken = await this.generateAccessToken(user);
    return { accessToken, user };
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(user, 'access'),
      this.generateToken(user, 'refresh'),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: User): Promise<string> {
    return this.generateToken(user, 'access');
  }

  private async generateToken(
    user: User,
    type: 'access' | 'refresh',
  ): Promise<string> {
    const payload =
      type === 'access'
        ? AuthActions.createAccessTokenPayload(user)
        : AuthActions.createRefreshTokenPayload(user);

    const config = {
      access: {
        expiresIn: Number(
          this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        ),
        secret: await this.jwtKeyProvider.getSigningKey('HS256'),
      },
      refresh: {
        expiresIn: Number(
          this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
        ),
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      },
    }[type];

    return this.jwtService.signAsync(payload, config);
  }
}
